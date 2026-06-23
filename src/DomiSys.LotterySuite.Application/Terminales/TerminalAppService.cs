using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Permissions;
using DomiSys.LotterySuite.Shared;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Terminales;

[Authorize(LotterySuitePermissions.Terminales.Default)]
public class TerminalAppService :
    CrudAppService<Terminal, TerminalDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarTerminalDto>,
    ITerminalAppService
{
    public TerminalAppService(IRepository<Terminal, Guid> repository) : base(repository)
    {
        GetPolicyName = LotterySuitePermissions.Terminales.Default;
        GetListPolicyName = LotterySuitePermissions.Terminales.Default;
        CreatePolicyName = LotterySuitePermissions.Terminales.Create;
        UpdatePolicyName = LotterySuitePermissions.Terminales.Edit;
        DeletePolicyName = LotterySuitePermissions.Terminales.Delete;
    }

    public override async Task<PagedResultDto<TerminalDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await Repository.GetQueryableAsync();
        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(x =>
                x.Nombre.ToLower().Contains(f) ||
                x.Codigo.ToLower().Contains(f) ||
                x.NombreVendedor.ToLower().Contains(f));
        }
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        queryable = !string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderBy(input.Sorting)
            : queryable.OrderBy(x => x.Codigo);
        var items = await AsyncExecuter.ToListAsync(queryable.Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<TerminalDto>(totalCount, ObjectMapper.Map<List<Terminal>, List<TerminalDto>>(items));
    }

    [Authorize(LotterySuitePermissions.Terminales.Suspender)]
    public async Task<TerminalDto> ActivarAsync(Guid id)
    {
        var terminal = await Repository.GetAsync(id);
        terminal.Activar();
        await Repository.UpdateAsync(terminal, autoSave: true);
        return ObjectMapper.Map<Terminal, TerminalDto>(terminal);
    }

    [Authorize(LotterySuitePermissions.Terminales.Suspender)]
    public async Task<TerminalDto> SuspenderAsync(Guid id)
    {
        var terminal = await Repository.GetAsync(id);
        terminal.Suspender();
        await Repository.UpdateAsync(terminal, autoSave: true);
        return ObjectMapper.Map<Terminal, TerminalDto>(terminal);
    }

    [Authorize(LotterySuitePermissions.Terminales.Suspender)]
    public async Task<TerminalDto> BloquearAsync(Guid id)
    {
        var terminal = await Repository.GetAsync(id);
        terminal.Bloquear();
        await Repository.UpdateAsync(terminal, autoSave: true);
        return ObjectMapper.Map<Terminal, TerminalDto>(terminal);
    }

    protected override Task<Terminal> MapToEntityAsync(CrearActualizarTerminalDto input)
    {
        var terminal = new Terminal(
            GuidGenerator.Create(),
            input.Codigo,
            input.Nombre,
            input.NombreVendedor,
            input.Pin ?? string.Empty
        );
        terminal.PorcentajeComisionVenta = input.PorcentajeComisionVenta;
        terminal.PorcentajeComisionVerde = input.PorcentajeComisionVerde;
        terminal.Ubicacion = input.Ubicacion;
        terminal.Telefono = input.Telefono;
        terminal.Notas = input.Notas;
        terminal.LimiteVentaDiaria = input.LimiteVentaDiaria;
        terminal.LimiteCuadre = input.LimiteCuadre;
        terminal.PuedePagarGanadores = input.PuedePagarGanadores;
        return Task.FromResult(terminal);
    }

    protected override async Task MapToEntityAsync(CrearActualizarTerminalDto input, Terminal entity)
    {
        entity.Codigo = input.Codigo;
        entity.Nombre = input.Nombre;
        entity.NombreVendedor = input.NombreVendedor;
        if (!string.IsNullOrEmpty(input.Pin))
            entity.PinVendedor = input.Pin;
        entity.PorcentajeComisionVenta = input.PorcentajeComisionVenta;
        entity.PorcentajeComisionVerde = input.PorcentajeComisionVerde;
        entity.Ubicacion = input.Ubicacion;
        entity.Telefono = input.Telefono;
        entity.Notas = input.Notas;
        entity.LimiteVentaDiaria = input.LimiteVentaDiaria;
        entity.LimiteCuadre = input.LimiteCuadre;
        entity.PuedePagarGanadores = input.PuedePagarGanadores;
        await Task.CompletedTask;
    }
}
