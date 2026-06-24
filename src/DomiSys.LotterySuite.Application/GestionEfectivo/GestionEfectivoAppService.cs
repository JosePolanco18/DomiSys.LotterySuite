using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.GestionEfectivo;

[Authorize]
public class GestionEfectivoAppService : ApplicationService, IGestionEfectivoAppService
{
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IRepository<MovimientoEfectivo, Guid> _movimientoRepository;
    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<CuadreTerminal, Guid> _cuadreRepository;
    private readonly IRepository<ConfiguracionGeneral, Guid> _configuracionRepository;
    private readonly GestionEfectivoManager _manager;

    public GestionEfectivoAppService(
        IRepository<Terminal, Guid> terminalRepository,
        IRepository<MovimientoEfectivo, Guid> movimientoRepository,
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<CuadreTerminal, Guid> cuadreRepository,
        IRepository<ConfiguracionGeneral, Guid> configuracionRepository,
        GestionEfectivoManager manager)
    {
        _terminalRepository = terminalRepository;
        _movimientoRepository = movimientoRepository;
        _ticketRepository = ticketRepository;
        _cuadreRepository = cuadreRepository;
        _configuracionRepository = configuracionRepository;
        _manager = manager;
    }

    public async Task<MovimientoEfectivoDto> RegistrarEntregaAdminAsync(RegistrarTransferenciaDto input)
    {
        if (input.Monto <= 0)
            throw new UserFriendlyException("El monto debe ser mayor a cero.");

        var terminal = await _terminalRepository.GetAsync(input.TerminalId);
        var mov = await _manager.RegistrarMovimientoAsync(
            terminal, TipoMovimientoEfectivo.EntregaFondosAdmin, input.Monto,
            null, CurrentUser.UserName ?? "admin", input.Notas);
        await _terminalRepository.UpdateAsync(terminal, autoSave: true);
        return MapToDto(mov, terminal.Nombre);
    }

    public async Task<MovimientoEfectivoDto> RegistrarEntregaTerminalAsync(RegistrarTransferenciaDto input)
    {
        if (input.Monto <= 0)
            throw new UserFriendlyException("El monto debe ser mayor a cero.");

        var terminal = await _terminalRepository.GetAsync(input.TerminalId);
        var mov = await _manager.RegistrarMovimientoAsync(
            terminal, TipoMovimientoEfectivo.EntregaFondosTerminal, -input.Monto,
            null, CurrentUser.UserName ?? "admin", input.Notas);
        await _terminalRepository.UpdateAsync(terminal, autoSave: true);
        return MapToDto(mov, terminal.Nombre);
    }

    public async Task<PagedResultDto<MovimientoEfectivoDto>> GetMovimientosAsync(
        Guid terminalId, PagedAndSortedResultRequestDto input)
    {
        var q = await _movimientoRepository.WithDetailsAsync(m => m.Terminal);
        var filtered = q.Where(m => m.TerminalId == terminalId);
        var totalCount = await AsyncExecuter.CountAsync(filtered);
        var items = await AsyncExecuter.ToListAsync(
            filtered.OrderByDescending(m => m.FechaMovimiento)
                .Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<MovimientoEfectivoDto>(totalCount,
            items.Select(m => MapToDto(m, m.Terminal?.Nombre ?? string.Empty)).ToList());
    }

    public async Task<List<ResumenEfectivoTerminalDto>> GetResumenTodasTerminalesAsync()
    {
        var terminales = await _terminalRepository.GetListAsync();
        return terminales.Select(t => new ResumenEfectivoTerminalDto
        {
            TerminalId = t.Id,
            Nombre = t.Nombre,
            NombreVendedor = t.NombreVendedor,
            SaldoEfectivo = t.SaldoEfectivo
        }).ToList();
    }

    public async Task<PreviewLiquidacionDto> GetPreviewLiquidacionAsync(Guid terminalId)
    {
        var terminal = await _terminalRepository.GetAsync(terminalId);

        var ultimoQ = await _cuadreRepository.GetQueryableAsync();
        var ultimo = await AsyncExecuter.FirstOrDefaultAsync(
            ultimoQ.Where(c => c.TerminalId == terminalId).OrderByDescending(c => c.FechaCuadre));

        var desde = ultimo?.PeriodoFin ?? DateTime.MinValue;
        var tQ = await _ticketRepository.GetQueryableAsync();

        var ventas = await AsyncExecuter.SumAsync(
            tQ.Where(t => t.TerminalId == terminalId && t.FechaCreacion > desde && t.Estado != EstadoTicket.Anulado),
            t => t.MontoTotal);
        var premios = await AsyncExecuter.SumAsync(
            tQ.Where(t => t.TerminalId == terminalId && t.Estado == EstadoTicket.Pagado && t.FechaPago > desde),
            t => t.TotalPremios);

        var config = await AsyncExecuter.FirstOrDefaultAsync(await _configuracionRepository.GetQueryableAsync());
        var cv = terminal.PorcentajeComisionVenta ?? config?.ComisionVentaPorDefecto ?? 7m;
        var cg = terminal.PorcentajeComisionVerde ?? config?.ComisionVerdePorDefecto ?? 5m;
        var montoComisionVenta = ventas * cv / 100;
        var montoComisionVerde = ventas > premios ? (ventas - premios) * cg / 100 : 0;
        var totalComisiones = montoComisionVenta + montoComisionVerde;

        return new PreviewLiquidacionDto
        {
            SaldoEfectivo = terminal.SaldoEfectivo,
            VentasBrutas = ventas,
            TotalPremiosPagados = premios,
            PorcentajeComisionVenta = cv,
            MontoComisionVenta = montoComisionVenta,
            PorcentajeComisionVerde = cg,
            MontoComisionVerde = montoComisionVerde,
            TotalComisiones = totalComisiones,
            MontoSugeridoEntrega = Math.Max(0, terminal.SaldoEfectivo - totalComisiones)
        };
    }

    private static MovimientoEfectivoDto MapToDto(MovimientoEfectivo m, string nombreTerminal)
    {
        return new MovimientoEfectivoDto
        {
            Id = m.Id,
            TerminalId = m.TerminalId,
            NombreTerminal = nombreTerminal,
            Tipo = m.Tipo,
            Monto = m.Monto,
            SaldoAnterior = m.SaldoAnterior,
            SaldoNuevo = m.SaldoNuevo,
            ReferenciaId = m.ReferenciaId,
            Notas = m.Notas,
            RegistradoPor = m.RegistradoPor,
            FechaMovimiento = m.FechaMovimiento
        };
    }
}
