using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Permissions;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace DomiSys.LotterySuite.Loterias;

[Authorize(LotterySuitePermissions.Loterias.Resultados.Default)]
public class ResultadoSorteoAppService : ApplicationService, IResultadoSorteoAppService
{
    private readonly IRepository<ResultadoSorteo, Guid> _resultadoRepository;
    private readonly IRepository<DetalleTicket, Guid> _detalleTicketRepository;
    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<ConfiguracionPagoSorteo, Guid> _configPagoSorteoRepository;

    public ResultadoSorteoAppService(
        IRepository<ResultadoSorteo, Guid> resultadoRepository,
        IRepository<DetalleTicket, Guid> detalleTicketRepository,
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepository)
    {
        _resultadoRepository = resultadoRepository;
        _detalleTicketRepository = detalleTicketRepository;
        _ticketRepository = ticketRepository;
        _configPagoSorteoRepository = configPagoSorteoRepository;
    }

    [Authorize(LotterySuitePermissions.Loterias.Resultados.Create)]
    public async Task<ResultadoSorteoDto> RegistrarAsync(CrearResultadoSorteoDto input)
    {
        var existente = await _resultadoRepository.FirstOrDefaultAsync(
            r => r.SorteoId == input.SorteoId && r.Fecha.Date == input.Fecha.Date);

        if (existente != null)
            throw new UserFriendlyException("Ya existe un resultado para este sorteo en esta fecha.");

        var resultado = new ResultadoSorteo(
            GuidGenerator.Create(),
            input.SorteoId,
            input.Fecha,
            input.Primera,
            input.Segunda,
            input.Tercera,
            FuenteResultado.Manual
        );
        resultado.RegistradoPor = CurrentUser.UserName;

        await _resultadoRepository.InsertAsync(resultado, autoSave: true);

        await CalcularGanadoresAsync(resultado);

        var queryable = await _resultadoRepository.WithDetailsAsync(r => r.Sorteo);
        var saved = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(r => r.Id == resultado.Id));
        return ObjectMapper.Map<ResultadoSorteo, ResultadoSorteoDto>(saved!);
    }

    public async Task<PagedResultDto<ResultadoSorteoDto>> ObtenerListaAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await _resultadoRepository.WithDetailsAsync(r => r.Sorteo);
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.OrderByDescending(r => r.Fecha).ThenBy(r => r.Sorteo.HoraSorteo)
                .Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<ResultadoSorteoDto>(totalCount,
            ObjectMapper.Map<List<ResultadoSorteo>, List<ResultadoSorteoDto>>(items));
    }

    public async Task<List<ResultadoSorteoDto>> ObtenerPorFechaAsync(DateTime fecha)
    {
        var queryable = await _resultadoRepository.WithDetailsAsync(r => r.Sorteo);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Where(r => r.Fecha.Date == fecha.Date).OrderBy(r => r.Sorteo.HoraSorteo));
        return ObjectMapper.Map<List<ResultadoSorteo>, List<ResultadoSorteoDto>>(items);
    }

    public async Task<List<ResultadoSorteoDto>> ObtenerUltimosAsync(int cantidad = 10)
    {
        var queryable = await _resultadoRepository.WithDetailsAsync(r => r.Sorteo);
        var items = await AsyncExecuter.ToListAsync(
            queryable.OrderByDescending(r => r.Fecha).ThenByDescending(r => r.FechaRegistro).Take(cantidad));
        return ObjectMapper.Map<List<ResultadoSorteo>, List<ResultadoSorteoDto>>(items);
    }

    private async Task CalcularGanadoresAsync(ResultadoSorteo resultado)
    {
        // Load position-based payout config for this sorteo
        var configQueryable = await _configPagoSorteoRepository.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            configQueryable.Where(c => c.SorteoId == resultado.SorteoId));

        var detallesQueryable = await _detalleTicketRepository.GetQueryableAsync();
        var detalles = await AsyncExecuter.ToListAsync(
            detallesQueryable.Where(d =>
                d.SorteoId == resultado.SorteoId &&
                d.FechaSorteo.Date == resultado.Fecha.Date &&
                !d.EsGanador));

        var ticketIds = new HashSet<Guid>();

        foreach (var detalle in detalles)
        {
            decimal pago = 0;
            decimal multiplicador = 0;

            switch (detalle.TipoJugada)
            {
                case TipoJugada.Quiniela:
                    if (detalle.PrimerNumero == resultado.Primera)
                    {
                        multiplicador = config?.QuinielaPrimera ?? 60;
                        pago = detalle.Monto * multiplicador;
                    }
                    else if (detalle.PrimerNumero == resultado.Segunda)
                    {
                        multiplicador = config?.QuinielaSegunda ?? 40;
                        pago = detalle.Monto * multiplicador;
                    }
                    else if (detalle.PrimerNumero == resultado.Tercera)
                    {
                        multiplicador = config?.QuinielaTercera ?? 20;
                        pago = detalle.Monto * multiplicador;
                    }
                    break;

                case TipoJugada.Pale:
                    if (detalle.SegundoNumero.HasValue && detalle.PrimerNumero != detalle.SegundoNumero)
                    {
                        var nums = new[] { detalle.PrimerNumero, detalle.SegundoNumero.Value };
                        var positions = new HashSet<int>();
                        foreach (var n in nums)
                        {
                            if (n == resultado.Primera) positions.Add(1);
                            else if (n == resultado.Segunda) positions.Add(2);
                            else if (n == resultado.Tercera) positions.Add(3);
                        }
                        if (positions.Count == 2)
                        {
                            if (positions.Contains(2) && positions.Contains(3) && !positions.Contains(1))
                            {
                                multiplicador = config?.PaleSegundaTercera ?? 500;
                            }
                            else
                            {
                                multiplicador = config?.PalePrimeraSegunda ?? 1000;
                            }
                            pago = detalle.Monto * multiplicador;
                        }
                    }
                    break;

                case TipoJugada.Tripleta:
                    if (EsTripletaGanadora(detalle, resultado))
                    {
                        multiplicador = config?.Tripleta ?? 100000;
                        pago = detalle.Monto * multiplicador;
                    }
                    break;

                case TipoJugada.SuperPale:
                    if (detalle.SegundoNumero.HasValue && detalle.SegundoSorteoId.HasValue)
                    {
                        var resultado2 = await ObtenerResultadoAsync(detalle.SegundoSorteoId.Value, resultado.Fecha);
                        if (resultado2 != null)
                        {
                            var n1 = detalle.PrimerNumero;
                            var n2 = detalle.SegundoNumero.Value;
                            if ((n1 == resultado.Primera && n2 == resultado2.Primera) ||
                                (n2 == resultado.Primera && n1 == resultado2.Primera))
                            {
                                multiplicador = config?.SuperPale ?? 1000;
                                pago = detalle.Monto * multiplicador;
                            }
                        }
                    }
                    break;
            }

            if (pago > 0)
            {
                detalle.MarcarComoGanador(pago, multiplicador);
                await _detalleTicketRepository.UpdateAsync(detalle, autoSave: true);
                ticketIds.Add(detalle.TicketId);
            }
        }

        foreach (var ticketId in ticketIds)
        {
            var ticketQueryable = await _ticketRepository.WithDetailsAsync(t => t.Detalles);
            var ticket = await AsyncExecuter.FirstOrDefaultAsync(ticketQueryable.Where(t => t.Id == ticketId));
            if (ticket != null)
            {
                ticket.CalcularPremios();
                await _ticketRepository.UpdateAsync(ticket, autoSave: true);
            }
        }
    }

    private async Task<ResultadoSorteo?> ObtenerResultadoAsync(Guid sorteoId, DateTime fecha)
    {
        var queryable = await _resultadoRepository.GetQueryableAsync();
        return await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(r => r.SorteoId == sorteoId && r.Fecha.Date == fecha.Date));
    }

    private static bool EsTripletaGanadora(DetalleTicket detalle, ResultadoSorteo resultado)
    {
        if (!detalle.SegundoNumero.HasValue || !detalle.TercerNumero.HasValue) return false;
        var jugada = new HashSet<int> { detalle.PrimerNumero, detalle.SegundoNumero.Value, detalle.TercerNumero.Value };
        var ganadores = new HashSet<int> { resultado.Primera, resultado.Segunda, resultado.Tercera };
        return jugada.SetEquals(ganadores);
    }
}
