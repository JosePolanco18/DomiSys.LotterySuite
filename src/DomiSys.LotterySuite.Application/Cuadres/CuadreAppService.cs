using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.Permissions;
using DomiSys.LotterySuite.Shared;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using DomiSys.LotterySuite.Loterias;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace DomiSys.LotterySuite.Cuadres;

[Authorize(LotterySuitePermissions.Cuadres.Default)]
public class CuadreAppService : ApplicationService, ICuadreAppService
{
    private readonly IRepository<CuadreTerminal, Guid> _cuadreRepository;
    private readonly IRepository<Terminal, Guid> _terminalRepository;
    private readonly IRepository<Ticket, Guid> _ticketRepository;
    private readonly IRepository<ConfiguracionGeneral, Guid> _configuracionRepository;

    public CuadreAppService(
        IRepository<CuadreTerminal, Guid> cuadreRepository,
        IRepository<Terminal, Guid> terminalRepository,
        IRepository<Ticket, Guid> ticketRepository,
        IRepository<ConfiguracionGeneral, Guid> configuracionRepository)
    {
        _cuadreRepository = cuadreRepository;
        _terminalRepository = terminalRepository;
        _ticketRepository = ticketRepository;
        _configuracionRepository = configuracionRepository;
    }

    [Authorize(LotterySuitePermissions.Cuadres.Create)]
    public async Task<CuadreTerminalDto> GenerarCuadreAsync(GenerarCuadreDto input)
    {
        var terminal = await _terminalRepository.GetAsync(input.TerminalId);

        var ultimoCuadreQueryable = await _cuadreRepository.GetQueryableAsync();
        var ultimoCuadre = await AsyncExecuter.FirstOrDefaultAsync(
            ultimoCuadreQueryable
                .Where(c => c.TerminalId == input.TerminalId)
                .OrderByDescending(c => c.FechaCuadre));

        var periodoInicio = ultimoCuadre?.PeriodoFin ?? DateTime.MinValue;
        var periodoFin = DateTime.UtcNow;

        var ticketsQueryable = await _ticketRepository.GetQueryableAsync();

        var ventasBrutas = await AsyncExecuter.SumAsync(
            ticketsQueryable.Where(t =>
                t.TerminalId == input.TerminalId &&
                t.FechaCreacion > periodoInicio &&
                t.FechaCreacion <= periodoFin &&
                t.Estado != EstadoTicket.Anulado),
            t => t.MontoTotal);

        var premiosPagados = await AsyncExecuter.SumAsync(
            ticketsQueryable.Where(t =>
                t.TerminalId == input.TerminalId &&
                t.Estado == EstadoTicket.Pagado &&
                t.FechaPago > periodoInicio &&
                t.FechaPago <= periodoFin),
            t => t.TotalPremios);

        var config = await _configuracionRepository.FindAsync(ConfiguracionGeneral.SingletonId);
        var comisionVenta = terminal.PorcentajeComisionVenta ?? config?.ComisionVentaPorDefecto ?? 7m;
        var comisionVerde = terminal.PorcentajeComisionVerde ?? config?.ComisionVerdePorDefecto ?? 5m;

        var cuadre = new CuadreTerminal(
            GuidGenerator.Create(),
            input.TerminalId,
            periodoInicio,
            periodoFin,
            ventasBrutas,
            premiosPagados,
            comisionVenta,
            comisionVerde,
            CurrentUser.UserName ?? "admin"
        );
        cuadre.Notas = input.Notas;

        await _cuadreRepository.InsertAsync(cuadre, autoSave: true);

        var queryable = await _cuadreRepository.WithDetailsAsync(c => c.Terminal);
        var saved = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(c => c.Id == cuadre.Id));
        return ObjectMapper.Map<CuadreTerminal, CuadreTerminalDto>(saved!);
    }

    public async Task<CuadreTerminalDto> ObtenerAsync(Guid id)
    {
        var queryable = await _cuadreRepository.WithDetailsAsync(c => c.Terminal);
        var cuadre = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(c => c.Id == id))
            ?? throw new UserFriendlyException("Cuadre no encontrado.");
        return ObjectMapper.Map<CuadreTerminal, CuadreTerminalDto>(cuadre);
    }

    public async Task<PagedResultDto<CuadreTerminalDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await _cuadreRepository.WithDetailsAsync(c => c.Terminal);

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(c =>
                c.Terminal.Nombre.ToLower().Contains(f) ||
                c.Terminal.NombreVendedor.ToLower().Contains(f));
        }

        var totalCount = await AsyncExecuter.CountAsync(queryable);

        queryable = !string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderBy(input.Sorting)
            : queryable.OrderByDescending(c => c.FechaCuadre);

        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<CuadreTerminalDto>(totalCount,
            ObjectMapper.Map<List<CuadreTerminal>, List<CuadreTerminalDto>>(items));
    }

    public async Task<PagedResultDto<CuadreTerminalDto>> ObtenerPorTerminalAsync(Guid terminalId, PagedAndSortedResultRequestDto input)
    {
        var queryable = await _cuadreRepository.WithDetailsAsync(c => c.Terminal);
        var filtered = queryable.Where(c => c.TerminalId == terminalId);
        var totalCount = await AsyncExecuter.CountAsync(filtered);
        var items = await AsyncExecuter.ToListAsync(
            filtered.OrderByDescending(c => c.FechaCuadre)
                .Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<CuadreTerminalDto>(totalCount,
            ObjectMapper.Map<List<CuadreTerminal>, List<CuadreTerminalDto>>(items));
    }

    public async Task<CuadreTerminalDto> ObtenerResumenTerminalAsync(Guid terminalId)
    {
        var terminal = await _terminalRepository.GetAsync(terminalId);

        var ultimoCuadreQueryable = await _cuadreRepository.GetQueryableAsync();
        var ultimoCuadre = await AsyncExecuter.FirstOrDefaultAsync(
            ultimoCuadreQueryable
                .Where(c => c.TerminalId == terminalId)
                .OrderByDescending(c => c.FechaCuadre));

        var desde = ultimoCuadre?.PeriodoFin ?? DateTime.MinValue;

        var ticketsQueryable = await _ticketRepository.GetQueryableAsync();

        var ventasBrutas = await AsyncExecuter.SumAsync(
            ticketsQueryable.Where(t =>
                t.TerminalId == terminalId &&
                t.FechaCreacion > desde &&
                t.Estado != EstadoTicket.Anulado),
            t => t.MontoTotal);

        var premiosPagados = await AsyncExecuter.SumAsync(
            ticketsQueryable.Where(t =>
                t.TerminalId == terminalId &&
                t.Estado == EstadoTicket.Pagado &&
                t.FechaPago > desde),
            t => t.TotalPremios);

        var config = await _configuracionRepository.FindAsync(ConfiguracionGeneral.SingletonId);
        var comisionVenta = terminal.PorcentajeComisionVenta ?? config?.ComisionVentaPorDefecto ?? 7m;
        var comisionVerde = terminal.PorcentajeComisionVerde ?? config?.ComisionVerdePorDefecto ?? 5m;

        return new CuadreTerminalDto
        {
            TerminalId = terminalId,
            NombreTerminal = terminal.Nombre,
            NombreVendedor = terminal.NombreVendedor,
            PeriodoInicio = desde,
            PeriodoFin = DateTime.UtcNow,
            VentasBrutas = ventasBrutas,
            TotalPremiosPagados = premiosPagados,
            PorcentajeComisionVenta = comisionVenta,
            MontoComisionVenta = ventasBrutas * (comisionVenta / 100),
            QuedoEnVerde = ventasBrutas > premiosPagados,
            PorcentajeComisionVerde = comisionVerde,
            MontoComisionVerde = ventasBrutas > premiosPagados
                ? (ventasBrutas - premiosPagados) * (comisionVerde / 100) : 0,
            BalanceNeto = ventasBrutas - premiosPagados
                - (ventasBrutas * comisionVenta / 100)
                - (ventasBrutas > premiosPagados ? (ventasBrutas - premiosPagados) * comisionVerde / 100 : 0)
        };
    }
}
