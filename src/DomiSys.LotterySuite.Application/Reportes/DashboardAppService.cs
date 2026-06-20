using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Reportes;

[Authorize]
public class DashboardAppService : ApplicationService, IDashboardAppService
{
    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<DetalleTicket, Guid> _detalleRepository;
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IRepository<ResultadoSorteo, Guid> _resultadoRepository;
    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepository;
    private readonly IRepository<Loteria, Guid> _loteriaRepository;

    public DashboardAppService(
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<DetalleTicket, Guid> detalleRepository,
        IRepository<Terminal, Guid> terminalRepository,
        IRepository<ResultadoSorteo, Guid> resultadoRepository,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepository,
        IRepository<Loteria, Guid> loteriaRepository)
    {
        _ticketRepository = ticketRepository;
        _detalleRepository = detalleRepository;
        _terminalRepository = terminalRepository;
        _resultadoRepository = resultadoRepository;
        _acumuladoRepository = acumuladoRepository;
        _loteriaRepository = loteriaRepository;
    }

    public async Task<DashboardDto> ObtenerDashboardAsync()
    {
        var hoyRD = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaRd).Date;
        var dto = new DashboardDto();

        // Tickets de hoy
        var ticketQueryable = await _ticketRepository.WithDetailsAsync(t => t.Terminal);
        var ticketsHoy = await AsyncExecuter.ToListAsync(
            ticketQueryable.Where(t => t.FechaCreacion.Date == hoyRD && t.Estado != EstadoTicket.Anulado));

        dto.TicketsHoy = ticketsHoy.Count;
        dto.VentasHoy = ticketsHoy.Sum(t => t.MontoTotal);
        dto.PremiosPagadosHoy = ticketsHoy.Where(t => t.Estado == EstadoTicket.Pagado).Sum(t => t.TotalPremios);

        // Terminales activas
        var terminalQueryable = await _terminalRepository.GetQueryableAsync();
        dto.TerminalesActivas = await AsyncExecuter.CountAsync(
            terminalQueryable.Where(t => t.Estado == EstadoTerminal.Activa));

        // Ventas por terminal hoy
        dto.VentasPorTerminal = ticketsHoy
            .GroupBy(t => new { t.TerminalId, t.Terminal.Nombre, t.Terminal.NombreVendedor })
            .Select(g => new VentaPorTerminalDto
            {
                NombreTerminal = g.Key.Nombre,
                NombreVendedor = g.Key.NombreVendedor,
                MontoVendido = g.Sum(t => t.MontoTotal),
                CantidadTickets = g.Count()
            })
            .OrderByDescending(v => v.MontoVendido)
            .ToList();

        // Últimos resultados (load Sorteo, then resolve Loteria names separately)
        var resultadoQueryable = await _resultadoRepository.WithDetailsAsync(r => r.Sorteo);
        var resultados = await AsyncExecuter.ToListAsync(
            resultadoQueryable.OrderByDescending(r => r.Fecha).ThenByDescending(r => r.FechaRegistro).Take(10));

        var loteriaIds = resultados.Where(r => r.Sorteo != null).Select(r => r.Sorteo.LoteriaId).Distinct().ToList();
        var loterias = await _loteriaRepository.GetListAsync(l => loteriaIds.Contains(l.Id));
        var loteriaMap = loterias.ToDictionary(l => l.Id, l => l.Nombre);

        dto.UltimosResultados = resultados.Select(r => new ResultadoRecienteDto
        {
            NombreLoteria = r.Sorteo != null && loteriaMap.TryGetValue(r.Sorteo.LoteriaId, out var nombre) ? nombre : string.Empty,
            NombreSorteo = r.Sorteo?.Nombre ?? string.Empty,
            Fecha = r.Fecha,
            Primera = r.Primera,
            Segunda = r.Segunda,
            Tercera = r.Tercera
        }).ToList();

        // Números más vendidos hoy
        var acumuladoQueryable = await _acumuladoRepository.GetQueryableAsync();
        var acumuladosHoy = await AsyncExecuter.ToListAsync(
            acumuladoQueryable.Where(a => a.Fecha.Date == hoyRD).OrderByDescending(a => a.MontoAcumulado).Take(15));

        dto.NumerosMasVendidos = acumuladosHoy.Select(a => new NumeroMasVendidoDto
        {
            Numero = a.Numero,
            MontoTotal = a.MontoAcumulado,
            CantidadJugadas = 0 // ponytail: skip count query, add if needed
        }).ToList();

        return dto;
    }
}
