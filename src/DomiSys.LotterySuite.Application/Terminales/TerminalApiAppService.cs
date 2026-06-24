using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Reportes;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Terminales;

// ponytail: AllowAnonymous bypasses ABP/OpenIddict auth; terminal JWT validated manually
[AllowAnonymous]
public class TerminalApiAppService : ApplicationService
{
    private readonly IRepository<Loteria, Guid> _loteriaRepository;
    private readonly IRepository<Sorteo, Guid> _sorteoRepository;
    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IRepository<ResultadoSorteo, Guid> _resultadoRepository;
    private readonly IRepository<CuadreTerminal, Guid> _cuadreRepository;
    private readonly IRepository<DetalleTicket, Guid> _detalleRepository;
    private readonly IRepository<ConfiguracionPagoSorteo, Guid> _configPagoSorteoRepository;
    private readonly IRepository<ConfiguracionMontoJugada, Guid> _configMontoRepository;
    private readonly IRepository<LimiteNumero, Guid> _limiteRepository;
    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;

    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    public TerminalApiAppService(
        IRepository<Loteria, Guid> loteriaRepository,
        IRepository<Sorteo, Guid> sorteoRepository,
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<Terminal, Guid> terminalRepository,
        IRepository<ResultadoSorteo, Guid> resultadoRepository,
        IRepository<CuadreTerminal, Guid> cuadreRepository,
        IRepository<DetalleTicket, Guid> detalleRepository,
        IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepository,
        IRepository<ConfiguracionMontoJugada, Guid> configMontoRepository,
        IRepository<LimiteNumero, Guid> limiteRepository,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepository,
        IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration)
    {
        _loteriaRepository = loteriaRepository;
        _sorteoRepository = sorteoRepository;
        _ticketRepository = ticketRepository;
        _terminalRepository = terminalRepository;
        _resultadoRepository = resultadoRepository;
        _cuadreRepository = cuadreRepository;
        _detalleRepository = detalleRepository;
        _configPagoSorteoRepository = configPagoSorteoRepository;
        _configMontoRepository = configMontoRepository;
        _limiteRepository = limiteRepository;
        _acumuladoRepository = acumuladoRepository;
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
    }

    // ponytail: stores the tenant scope at request level so it stays alive
    private IDisposable? _tenantScope;

    private Guid ValidateTerminalToken()
    {
        var auth = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(auth) || !auth.StartsWith("Bearer "))
            throw new UserFriendlyException("Token no proporcionado.");

        var token = auth["Bearer ".Length..];
        var key = _configuration["TerminalAuth:SecretKey"] ?? "LotterySuiteTerminalSecretKey2026!@#$%";
        var issuer = _configuration["TerminalAuth:Issuer"] ?? "LotterySuite";

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var result = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = issuer,
                ValidateLifetime = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
            }, out _);

            var terminalId = result.FindFirst("terminal_id")?.Value;
            if (string.IsNullOrEmpty(terminalId))
                throw new UserFriendlyException("Token inválido.");

            var tenantIdStr = result.FindFirst("tenant_id")?.Value;
            Guid? tenantId = !string.IsNullOrEmpty(tenantIdStr) ? Guid.Parse(tenantIdStr) : null;
            _tenantScope = CurrentTenant.Change(tenantId);

            return Guid.Parse(terminalId);
        }
        catch (SecurityTokenException)
        {
            throw new UserFriendlyException("Token expirado o inválido.");
        }
    }

    public async Task<List<LoteriaDto>> GetLoteriasActivasAsync()
    {
        ValidateTerminalToken();
        var ahoraRD = ObtenerHoraRD();
        var queryable = await _loteriaRepository.WithDetailsAsync(l => l.Sorteos);
        var loterias = await AsyncExecuter.ToListAsync(
            queryable.Where(l => l.Activa).OrderBy(l => l.Orden));
        var dtos = ObjectMapper.Map<List<Loteria>, List<LoteriaDto>>(loterias);
        foreach (var dto in dtos)
        {
            var loteria = loterias.First(l => l.Id == dto.Id);
            if (dto.Sorteos != null)
            {
                foreach (var sorteoDto in dto.Sorteos)
                {
                    var sorteo = loteria.Sorteos.FirstOrDefault(s => s.Id == sorteoDto.Id);
                    if (sorteo != null)
                        sorteoDto.EstaAbierto = sorteo.EstaAbiertoParaVentas(ahoraRD);
                }
            }
        }
        return dtos;
    }

    public async Task<List<SorteoDto>> GetSorteosAbiertosAsync()
    {
        ValidateTerminalToken();
        var ahoraRD = ObtenerHoraRD();
        var queryable = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(
            queryable.Where(s => s.Activo && s.Loteria.Activa));
        var abiertos = sorteos.Where(s => s.EstaAbiertoParaVentas(ahoraRD)).ToList();
        return ObjectMapper.Map<List<Sorteo>, List<SorteoDto>>(abiertos);
    }

    public async Task<List<SorteoDto>> GetSorteosPorLoteriaAsync(Guid loteriaId)
    {
        ValidateTerminalToken();
        var ahoraRD = ObtenerHoraRD();
        var queryable = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(
            queryable.Where(s => s.LoteriaId == loteriaId && s.Activo));
        var abiertos = sorteos.Where(s => s.EstaAbiertoParaVentas(ahoraRD)).ToList();
        return ObjectMapper.Map<List<Sorteo>, List<SorteoDto>>(abiertos);
    }

    public async Task<TicketDto> ProcesarVentaAsync(CrearTicketDto input)
    {
        var terminalId = ValidateTerminalToken();
        var terminal = await _terminalRepository.GetAsync(terminalId);
        if (!terminal.EstaActiva())
            throw new UserFriendlyException("Terminal no activa.");

        var ahoraRD = ObtenerHoraRD();
        var fechaHoy = ahoraRD.Date;

        await ValidarLimitesDiarioYCuadreAsync(terminal, fechaHoy);

        var detalles = input.Detalles;

        if (detalles == null || detalles.Count == 0)
            throw new UserFriendlyException("El ticket debe tener al menos una jugada.");

        var sorteoIds = detalles.Select(d => d.SorteoId).Distinct().ToList();
        var sorteosQ = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(sorteosQ.Where(s => sorteoIds.Contains(s.Id)));

        var configMontos = await _configMontoRepository.GetListAsync();

        foreach (var det in detalles)
        {
            var sorteo = sorteos.FirstOrDefault(s => s.Id == det.SorteoId)
                ?? throw new UserFriendlyException("Sorteo no encontrado.");
            if (!sorteo.EstaAbiertoParaVentas(ahoraRD))
                throw new UserFriendlyException($"'{sorteo.Loteria.Nombre} - {sorteo.Nombre}' no está abierto.");

            var cm = configMontos.FirstOrDefault(c => c.TipoJugada == det.TipoJugada);
            if (cm != null && det.Monto < cm.MontoMinimo)
                throw new UserFriendlyException($"Monto mínimo: {cm.MontoMinimo:N2}");
            if (cm != null && det.Monto > cm.MontoMaximo)
                throw new UserFriendlyException($"Monto máximo: {cm.MontoMaximo:N2}");

            foreach (var num in GetNums(det))
                await ValidarLimiteAsync(det.SorteoId, fechaHoy, num, det.Monto);
        }

        var ticketId = GuidGenerator.Create();
        var codigo = $"BK-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        var ticket = new Ticket(ticketId, codigo, terminalId, ahoraRD);

        foreach (var det in detalles)
        {
            var sorteo = sorteos.First(s => s.Id == det.SorteoId);
            var mult = await GetMultAsync(det.SorteoId, det.TipoJugada);
            ticket.Detalles.Add(new DetalleTicket(GuidGenerator.Create(), ticketId, det.SorteoId, fechaHoy,
                det.TipoJugada, det.PrimerNumero, det.Monto, mult, det.SegundoNumero, det.TercerNumero, det.SegundoSorteoId));
        }

        ticket.CalcularMontoTotal();
        ticket.HashVerificacion = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                Encoding.UTF8.GetBytes($"{ticket.Id}{ticket.CodigoTicket}{ticket.TerminalId}{ticket.MontoTotal}")));

        await _ticketRepository.InsertAsync(ticket, autoSave: true);
        terminal.RegistrarActividad();
        await _terminalRepository.UpdateAsync(terminal, autoSave: true);

        return await GetTicketAsync(ticketId);
    }

    public async Task<TicketDto> GetTicketAsync(Guid id)
    {
        ValidateTerminalToken();
        var q = await _ticketRepository.WithDetailsAsync(t => t.Terminal);
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(q.Where(t => t.Id == id))
            ?? throw new UserFriendlyException("Ticket no encontrado.");

        // Load detalles with Sorteo.Loteria for grouping
        var dq = await _detalleRepository.WithDetailsAsync(d => d.Sorteo, d => d.SegundoSorteo);
        var detalles = await AsyncExecuter.ToListAsync(dq.Where(d => d.TicketId == id));
        // Cargar Loteria de cada sorteo
        var sorteoIds = detalles.Select(d => d.SorteoId).Distinct().ToList();
        var sorteosQ = await _sorteoRepository.WithDetailsAsync(s => s.Loteria);
        var sorteosMap = (await AsyncExecuter.ToListAsync(sorteosQ.Where(s => sorteoIds.Contains(s.Id))))
            .ToDictionary(s => s.Id);
        foreach (var d in detalles)
        {
            if (sorteosMap.TryGetValue(d.SorteoId, out var sorteo))
                d.Sorteo = sorteo;
        }
        ticket.Detalles = detalles;

        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    public async Task<List<TicketDto>> GetMisTicketsAsync()
    {
        var terminalId = ValidateTerminalToken();
        var q = await _ticketRepository.WithDetailsAsync(t => t.Terminal);
        var tickets = await AsyncExecuter.ToListAsync(
            q.Where(t => t.TerminalId == terminalId).OrderByDescending(t => t.FechaCreacion).Take(50));
        return ObjectMapper.Map<List<Ticket>, List<TicketDto>>(tickets);
    }

    public async Task<List<TicketDto>> GetMisGanadoresAsync()
    {
        var terminalId = ValidateTerminalToken();
        var q = await _ticketRepository.WithDetailsAsync(t => t.Terminal);
        var tickets = await AsyncExecuter.ToListAsync(
            q.Where(t => t.TerminalId == terminalId && (t.Estado == EstadoTicket.Ganador || t.Estado == EstadoTicket.Pagado))
             .OrderByDescending(t => t.FechaCreacion));
        return ObjectMapper.Map<List<Ticket>, List<TicketDto>>(tickets);
    }

    public async Task<TicketDto> PagarGanadorAsync(Guid ticketId)
    {
        var terminalId = ValidateTerminalToken();
        var terminal = await _terminalRepository.GetAsync(terminalId);
        if (!terminal.PuedePagarGanadores)
            throw new UserFriendlyException("Esta terminal no tiene permiso para pagar tickets ganadores.");
        var q = await _ticketRepository.WithDetailsAsync(t => t.Detalles);
        var ticket = await AsyncExecuter.FirstOrDefaultAsync(q.Where(t => t.Id == ticketId))
            ?? throw new UserFriendlyException("Ticket no encontrado.");
        if (ticket.TerminalId != terminalId)
            throw new UserFriendlyException("Este ticket no pertenece a su terminal.");
        if (!ticket.EsPagable())
            throw new UserFriendlyException("Ticket no pagable.");
        ticket.MarcarComoPagado(terminalId);
        await _ticketRepository.UpdateAsync(ticket, autoSave: true);
        return ObjectMapper.Map<Ticket, TicketDto>(ticket);
    }

    public async Task<ConfiguracionGeneralDto> GetConfiguracionTicketAsync()
    {
        ValidateTerminalToken();
        var repo = LazyServiceProvider.LazyGetRequiredService<IRepository<Configuracion.ConfiguracionGeneral, Guid>>();
        var q = await repo.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            q);
        if (config == null) return new ConfiguracionGeneralDto { NombreEmpresa = "DomiSys Lottery", PieTicket = "Conserve este ticket" };
        return new ConfiguracionGeneralDto
        {
            NombreEmpresa = config.NombreEmpresa,
            TelefonoEmpresa = config.TelefonoEmpresa,
            PieTicket = config.PieTicket
        };
    }

    public async Task<List<ResultadoScrapedDto>> GetResultadosGeneralesAsync()
    {
        ValidateTerminalToken();
        var service = LazyServiceProvider.LazyGetRequiredService<ResultadosGeneralesAppService>();
        return await service.ObtenerTodosResultadosAsync();
    }

    public async Task<ResumenTerminalDto> GetResumenAsync()
    {
        var terminalId = ValidateTerminalToken();
        var terminal = await _terminalRepository.GetAsync(terminalId);

        var ultimoQ = await _cuadreRepository.GetQueryableAsync();
        var ultimo = await AsyncExecuter.FirstOrDefaultAsync(
            ultimoQ.Where(c => c.TerminalId == terminalId).OrderByDescending(c => c.FechaCuadre));

        var desde = ultimo?.PeriodoFin ?? DateTime.MinValue;
        var tQ = await _ticketRepository.GetQueryableAsync();
        var ticketsDesde = tQ.Where(t => t.TerminalId == terminalId && t.FechaCreacion > desde);

        var ventas = await AsyncExecuter.SumAsync(
            ticketsDesde.Where(t => t.Estado != EstadoTicket.Anulado), t => t.MontoTotal);
        var premios = await AsyncExecuter.SumAsync(
            tQ.Where(t => t.TerminalId == terminalId && t.Estado == EstadoTicket.Pagado && t.FechaPago > desde), t => t.TotalPremios);

        var totalTickets = await AsyncExecuter.CountAsync(ticketsDesde.Where(t => t.Estado != EstadoTicket.Anulado));
        var totalGanadores = await AsyncExecuter.CountAsync(ticketsDesde.Where(t => t.Estado == EstadoTicket.Ganador || t.Estado == EstadoTicket.Pagado));
        var totalAnulados = await AsyncExecuter.CountAsync(ticketsDesde.Where(t => t.Estado == EstadoTicket.Anulado));

        var cv = terminal.PorcentajeComisionVenta ?? 7m;
        var cg = terminal.PorcentajeComisionVerde ?? 5m;

        return new ResumenTerminalDto
        {
            VentasBrutas = ventas, TotalPremiosPagados = premios,
            TotalTickets = totalTickets, TotalGanadores = totalGanadores, TotalAnulados = totalAnulados,
            PorcentajeComisionVenta = cv, MontoComisionVenta = ventas * cv / 100,
            QuedoEnVerde = ventas > premios, PorcentajeComisionVerde = cg,
            MontoComisionVerde = ventas > premios ? (ventas - premios) * cg / 100 : 0,
            BalanceNeto = ventas - premios - (ventas * cv / 100) - (ventas > premios ? (ventas - premios) * cg / 100 : 0)
        };
    }

    // --- helpers ---
    private async Task ValidarLimitesDiarioYCuadreAsync(Terminal terminal, DateTime fechaHoy)
    {
        var tQ = await _ticketRepository.GetQueryableAsync();

        // Limite de venta diaria
        if (terminal.LimiteVentaDiaria.HasValue)
        {
            var ventasHoy = await AsyncExecuter.SumAsync(
                tQ.Where(t => t.TerminalId == terminal.Id && t.FechaCreacion.Date == fechaHoy && t.Estado != EstadoTicket.Anulado),
                t => t.MontoTotal);
            if (ventasHoy >= terminal.LimiteVentaDiaria.Value)
                throw new UserFriendlyException($"Terminal alcanzó el límite de venta diaria (RD${terminal.LimiteVentaDiaria.Value:N2}).");
        }

        // Limite de cuadre: balance desde último cuadre
        if (terminal.LimiteCuadre.HasValue)
        {
            var ultimoQ = await _cuadreRepository.GetQueryableAsync();
            var ultimo = await AsyncExecuter.FirstOrDefaultAsync(
                ultimoQ.Where(c => c.TerminalId == terminal.Id).OrderByDescending(c => c.FechaCuadre));
            var desde = ultimo?.PeriodoFin ?? DateTime.MinValue;

            var ventas = await AsyncExecuter.SumAsync(
                tQ.Where(t => t.TerminalId == terminal.Id && t.FechaCreacion > desde && t.Estado != EstadoTicket.Anulado),
                t => t.MontoTotal);
            var premios = await AsyncExecuter.SumAsync(
                tQ.Where(t => t.TerminalId == terminal.Id && t.Estado == EstadoTicket.Pagado && t.FechaPago > desde),
                t => t.TotalPremios);

            var balance = ventas - premios;
            if (balance >= terminal.LimiteCuadre.Value)
                throw new UserFriendlyException($"Terminal alcanzó el límite de cuadre (RD${terminal.LimiteCuadre.Value:N2}). Debe cuadrar antes de continuar vendiendo.");
        }
    }

    private static List<int> GetNums(CrearDetalleTicketDto d)
    {
        var nums = new List<int> { d.PrimerNumero };
        if (d.SegundoNumero.HasValue) nums.Add(d.SegundoNumero.Value);
        if (d.TercerNumero.HasValue) nums.Add(d.TercerNumero.Value);
        return nums;
    }

    private async Task ValidarLimiteAsync(Guid sorteoId, DateTime fecha, int numero, decimal monto)
    {
        var lq = await _limiteRepository.GetQueryableAsync();
        var limite = await AsyncExecuter.FirstOrDefaultAsync(lq.Where(l => l.SorteoId == sorteoId && l.Numero == numero));
        if (limite?.Bloqueado == true) throw new UserFriendlyException($"Número {numero:D2} bloqueado.");

        var aq = await _acumuladoRepository.GetQueryableAsync();
        var acum = await AsyncExecuter.FirstOrDefaultAsync(aq.Where(a => a.SorteoId == sorteoId && a.Fecha == fecha && a.Numero == numero));
        var actual = acum?.MontoAcumulado ?? 0;
        if (limite != null && actual + monto > limite.LimiteVentaMaximo)
            throw new UserFriendlyException($"Número {numero:D2} alcanzó límite.");

        if (acum == null)
        {
            acum = new AcumuladoVentaNumero(GuidGenerator.Create(), sorteoId, fecha, numero) { MontoAcumulado = monto, UltimaActualizacion = DateTime.UtcNow };
            await _acumuladoRepository.InsertAsync(acum, autoSave: true);
        }
        else
        {
            acum.MontoAcumulado += monto;
            acum.UltimaActualizacion = DateTime.UtcNow;
            await _acumuladoRepository.UpdateAsync(acum, autoSave: true);
        }
    }

    private async Task<decimal> GetMultAsync(Guid sorteoId, TipoJugada tipo)
    {
        var q = await _configPagoSorteoRepository.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(q.Where(x => x.SorteoId == sorteoId));
        return tipo switch
        {
            TipoJugada.Quiniela => config?.QuinielaPrimera ?? 60,
            TipoJugada.Pale => config?.PalePrimeraSegunda ?? 1000,
            TipoJugada.Tripleta => config?.Tripleta ?? 100000,
            TipoJugada.SuperPale => config?.SuperPale ?? 1000,
            _ => 0
        };
    }

    private static DateTime ObtenerHoraRD() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaRd);
}
