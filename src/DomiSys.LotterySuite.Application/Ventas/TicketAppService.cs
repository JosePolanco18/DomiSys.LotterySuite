using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Permissions;
using DomiSys.LotterySuite.Shared;
using DomiSys.LotterySuite.Terminales;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace DomiSys.LotterySuite.Ventas;

[Authorize]
public class TicketAppService : ApplicationService, ITicketAppService
{
    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IRepository<Sorteo, Guid> _sorteoRepository;
    private readonly IRepository<ConfiguracionPagoSorteo, Guid> _configuracionPagoSorteoRepository;
    private readonly IRepository<ConfiguracionMontoJugada, Guid> _configuracionMontoRepository;
    private readonly IRepository<LimiteNumero, Guid> _limiteNumeroRepository;
    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepository;
    private readonly IRepository<ConfiguracionGeneral, Guid> _configuracionGeneralRepository;

    public TicketAppService(
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<Terminal, Guid> terminalRepository,
        IRepository<Sorteo, Guid> sorteoRepository,
        IRepository<ConfiguracionPagoSorteo, Guid> configuracionPagoSorteoRepository,
        IRepository<ConfiguracionMontoJugada, Guid> configuracionMontoRepository,
        IRepository<LimiteNumero, Guid> limiteNumeroRepository,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepository,
        IRepository<ConfiguracionGeneral, Guid> configuracionGeneralRepository)
    {
        _ticketRepository = ticketRepository;
        _terminalRepository = terminalRepository;
        _sorteoRepository = sorteoRepository;
        _configuracionPagoSorteoRepository = configuracionPagoSorteoRepository;
        _configuracionMontoRepository = configuracionMontoRepository;
        _limiteNumeroRepository = limiteNumeroRepository;
        _acumuladoRepository = acumuladoRepository;
        _configuracionGeneralRepository = configuracionGeneralRepository;
    }

    [Authorize(LotterySuitePermissions.Ventas.PuntoDeVenta.Default)]
    public async Task<TicketDto> ProcesarVentaAdminAsync(CrearTicketAdminDto input)
    {
        return await ProcesarVentaInternaAsync(input.TerminalId, input.Detalles);
    }

    public async Task<TicketDto> ProcesarVentaAsync(CrearTicketDto input)
    {
        throw new UserFriendlyException("Este endpoint es para las terminales (Flutter). Use ProcesarVentaAdmin desde el panel.");
    }

    private async Task<TicketDto> ProcesarVentaInternaAsync(Guid terminalId, List<CrearDetalleTicketDto> detalles)
    {
        if (detalles == null || detalles.Count == 0)
            throw new UserFriendlyException("El ticket debe tener al menos una jugada.");

        var terminal = await _terminalRepository.GetAsync(terminalId);
        if (!terminal.EstaActiva())
            throw new UserFriendlyException("La terminal no está activa.");

        var ahoraRD = ObtenerHoraRD();
        var fechaHoy = ahoraRD.Date;

        var sorteoIds = detalles.Select(d => d.SorteoId)
            .Union(detalles.Where(d => d.SegundoSorteoId.HasValue).Select(d => d.SegundoSorteoId!.Value))
            .Distinct().ToList();

        var sorteosQueryable = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(
            sorteosQueryable.Where(s => sorteoIds.Contains(s.Id)));

        var configuracionesMonto = await _configuracionMontoRepository.GetListAsync();

        foreach (var detalle in detalles)
        {
            var sorteo = sorteos.FirstOrDefault(s => s.Id == detalle.SorteoId)
                ?? throw new UserFriendlyException($"Sorteo no encontrado.");

            if (!sorteo.EstaAbiertoParaVentas(ahoraRD))
                throw new UserFriendlyException($"El sorteo '{sorteo.Loteria.Nombre} - {sorteo.Nombre}' no está abierto para ventas.");

            var configMonto = configuracionesMonto.FirstOrDefault(c => c.TipoJugada == detalle.TipoJugada);
            if (configMonto != null)
            {
                if (detalle.Monto < configMonto.MontoMinimo)
                    throw new UserFriendlyException($"El monto mínimo para {detalle.TipoJugada} es {configMonto.MontoMinimo:N2}.");
                if (detalle.Monto > configMonto.MontoMaximo)
                    throw new UserFriendlyException($"El monto máximo para {detalle.TipoJugada} es {configMonto.MontoMaximo:N2}.");
            }

            var numerosAValidar = ObtenerNumerosDeJugada(detalle);
            foreach (var numero in numerosAValidar)
            {
                await ValidarLimiteNumeroAsync(detalle.SorteoId, fechaHoy, numero, detalle.Monto);
            }
        }

        var ticketId = GuidGenerator.Create();
        var codigoTicket = GenerarCodigoTicket();
        var ticket = new Ticket(ticketId, codigoTicket, terminalId, ahoraRD);

        foreach (var detalle in detalles)
        {
            var sorteo = sorteos.First(s => s.Id == detalle.SorteoId);
            var multiplicador = await ObtenerMultiplicadorAsync(detalle.SorteoId, detalle.TipoJugada);

            var detalleTicket = new DetalleTicket(
                GuidGenerator.Create(),
                ticketId,
                detalle.SorteoId,
                fechaHoy,
                detalle.TipoJugada,
                detalle.PrimerNumero,
                detalle.Monto,
                multiplicador,
                detalle.SegundoNumero,
                detalle.TercerNumero,
                detalle.SegundoSorteoId
            );
            ticket.Detalles.Add(detalleTicket);
        }

        ticket.CalcularMontoTotal();
        ticket.HashVerificacion = GenerarHash(ticket);

        await _ticketRepository.InsertAsync(ticket, autoSave: true);

        terminal.RegistrarActividad();
        await _terminalRepository.UpdateAsync(terminal, autoSave: true);

        return await ObtenerAsync(ticketId);
    }

    [Authorize(LotterySuitePermissions.Ventas.Tickets.Anular)]
    public async Task<TicketDto> AnularTicketAsync(Guid id, AnularTicketDto input)
    {
        var ticket = await _ticketRepository.GetAsync(id);

        if (!ticket.EsAnulable())
            throw new UserFriendlyException("Este ticket no puede ser anulado.");

        var config = await _configuracionGeneralRepository.FindAsync(ConfiguracionGeneral.SingletonId);
        var ventanaMinutos = config?.MinutosVentanaAnulacion ?? 5;

        if ((DateTime.UtcNow - ticket.FechaCreacion).TotalMinutes > ventanaMinutos)
            throw new UserFriendlyException(
                $"El tiempo para anular este ticket ha expirado. La ventana de anulación es de {ventanaMinutos} minutos.");

        ticket.Anular(CurrentUser.UserName ?? "admin", input.MotivoAnulacion);
        await _ticketRepository.UpdateAsync(ticket, autoSave: true);

        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    [Authorize(LotterySuitePermissions.Ventas.Tickets.PagarGanador)]
    public async Task<TicketDto> PagarGanadorAsync(Guid id)
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Detalles);
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(t => t.Id == id))
            ?? throw new UserFriendlyException("Ticket no encontrado.");

        if (!ticket.EsPagable())
            throw new UserFriendlyException("Este ticket no es pagable. Estado actual: " + ticket.Estado);

        ticket.MarcarComoPagado(ticket.TerminalId);
        await _ticketRepository.UpdateAsync(ticket, autoSave: true);

        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    public async Task<List<TicketDto>> ObtenerGanadoresAsync()
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Detalles, t => t.Terminal);
        var tickets = await AsyncExecuter.ToListAsync(
            queryable.Where(t => t.Estado == EstadoTicket.Ganador || t.Estado == EstadoTicket.Pagado)
                .OrderByDescending(t => t.FechaCreacion));
        return ObjectMapper.Map<List<Ticket>, List<TicketDto>>(tickets);
    }

    public async Task<TicketDto> ObtenerPorCodigoAsync(string codigoTicket)
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Detalles, t => t.Terminal);
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(t => t.CodigoTicket == codigoTicket))
            ?? throw new UserFriendlyException("Ticket no encontrado.");
        await CargarSorteosEnDetallesAsync(ticket);
        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    public async Task<TicketDto> ObtenerAsync(Guid id)
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Detalles, t => t.Terminal);
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(t => t.Id == id))
            ?? throw new UserFriendlyException("Ticket no encontrado.");
        await CargarSorteosEnDetallesAsync(ticket);
        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    private async Task CargarSorteosEnDetallesAsync(Ticket ticket)
    {
        if (ticket.Detalles == null || !ticket.Detalles.Any()) return;
        var sorteoIds = ticket.Detalles.Select(d => d.SorteoId).Distinct().ToList();
        var sorteosQ = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteosMap = (await AsyncExecuter.ToListAsync(sorteosQ.Where(s => sorteoIds.Contains(s.Id))))
            .ToDictionary(s => s.Id);
        foreach (var d in ticket.Detalles)
        {
            if (sorteosMap.TryGetValue(d.SorteoId, out var sorteo))
                d.Sorteo = sorteo;
        }
    }

    public async Task<PagedResultDto<TicketDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Terminal);

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(t =>
                t.CodigoTicket.ToLower().Contains(f) ||
                t.Terminal.Nombre.ToLower().Contains(f));
        }

        var totalCount = await AsyncExecuter.CountAsync(queryable);

        queryable = !string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderBy(input.Sorting)
            : queryable.OrderByDescending(t => t.FechaCreacion);

        var tickets = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<TicketDto>(totalCount, ObjectMapper.Map<List<Ticket>, List<TicketDto>>(tickets));
    }

    public async Task<PagedResultDto<TicketDto>> ObtenerPorTerminalAsync(Guid terminalId, PagedAndSortedResultRequestDto input)
    {
        var queryable = await _ticketRepository.WithDetailsAsync(t => t.Terminal);
        var filtered = queryable.Where(t => t.TerminalId == terminalId);
        var totalCount = await AsyncExecuter.CountAsync(filtered);
        var tickets = await AsyncExecuter.ToListAsync(
            filtered.OrderByDescending(t => t.FechaCreacion)
                .Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<TicketDto>(totalCount, ObjectMapper.Map<List<Ticket>, List<TicketDto>>(tickets));
    }

    private async Task ValidarLimiteNumeroAsync(Guid sorteoId, DateTime fecha, int numero, decimal monto)
    {
        var limiteQueryable = await _limiteNumeroRepository.GetQueryableAsync();
        var limite = await AsyncExecuter.FirstOrDefaultAsync(
            limiteQueryable.Where(l => l.SorteoId == sorteoId && l.Numero == numero));

        if (limite != null && limite.Bloqueado)
            throw new UserFriendlyException($"El número {numero:D2} está bloqueado para este sorteo.");

        var acumuladoQueryable = await _acumuladoRepository.GetQueryableAsync();
        var acumulado = await AsyncExecuter.FirstOrDefaultAsync(
            acumuladoQueryable.Where(a => a.SorteoId == sorteoId && a.Fecha == fecha && a.Numero == numero));

        var montoActual = acumulado?.MontoAcumulado ?? 0;
        if (limite != null && montoActual + monto > limite.LimiteVentaMaximo)
            throw new UserFriendlyException($"El número {numero:D2} ha alcanzado su límite de venta ({limite.LimiteVentaMaximo:N2}). Vendido: {montoActual:N2}.");

        if (acumulado == null)
        {
            acumulado = new AcumuladoVentaNumero(GuidGenerator.Create(), sorteoId, fecha, numero);
            acumulado.MontoAcumulado = monto;
            acumulado.UltimaActualizacion = DateTime.UtcNow;
            await _acumuladoRepository.InsertAsync(acumulado, autoSave: true);
        }
        else
        {
            acumulado.MontoAcumulado += monto;
            acumulado.UltimaActualizacion = DateTime.UtcNow;
            await _acumuladoRepository.UpdateAsync(acumulado, autoSave: true);
        }
    }

    private async Task<decimal> ObtenerMultiplicadorAsync(Guid sorteoId, TipoJugada tipoJugada)
    {
        var queryable = await _configuracionPagoSorteoRepository.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(c => c.SorteoId == sorteoId));

        // Return "best case" rate for display purposes
        return tipoJugada switch
        {
            TipoJugada.Quiniela => config?.QuinielaPrimera ?? 60,
            TipoJugada.Pale => config?.PalePrimeraSegunda ?? 1000,
            TipoJugada.Tripleta => config?.Tripleta ?? 100000,
            TipoJugada.SuperPale => config?.SuperPale ?? 1000,
            _ => 0
        };
    }

    private static List<int> ObtenerNumerosDeJugada(CrearDetalleTicketDto detalle)
    {
        var numeros = new List<int> { detalle.PrimerNumero };
        if (detalle.SegundoNumero.HasValue) numeros.Add(detalle.SegundoNumero.Value);
        if (detalle.TercerNumero.HasValue) numeros.Add(detalle.TercerNumero.Value);
        return numeros;
    }

    private static string GenerarCodigoTicket()
    {
        var fecha = DateTime.UtcNow.ToString("yyyyMMdd");
        var aleatorio = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"BK-{fecha}-{aleatorio}";
    }

    private static string GenerarHash(Ticket ticket)
    {
        var data = $"{ticket.Id}{ticket.CodigoTicket}{ticket.TerminalId}{ticket.MontoTotal}{ticket.FechaCreacion:O}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(bytes);
    }

    private static DateTime ObtenerHoraRD() =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaRd);
}
