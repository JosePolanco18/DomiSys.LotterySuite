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

namespace DomiSys.LotterySuite.Loterias;

[Authorize(LotterySuitePermissions.Loterias.Default)]
public class LoteriaAppService :
    CrudAppService<Loteria, LoteriaDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarLoteriaDto>,
    ILoteriaAppService
{
    public LoteriaAppService(IRepository<Loteria, Guid> repository) : base(repository)
    {
        GetPolicyName = LotterySuitePermissions.Loterias.GestionLoterias.Default;
        GetListPolicyName = LotterySuitePermissions.Loterias.GestionLoterias.Default;
        CreatePolicyName = LotterySuitePermissions.Loterias.GestionLoterias.Create;
        UpdatePolicyName = LotterySuitePermissions.Loterias.GestionLoterias.Edit;
        DeletePolicyName = LotterySuitePermissions.Loterias.GestionLoterias.Delete;
    }

    public override async Task<PagedResultDto<LoteriaDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await Repository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(x =>
                x.Nombre.ToLower().Contains(f) ||
                x.CodigoCorto.ToLower().Contains(f));
        }

        var totalCount = await AsyncExecuter.CountAsync(queryable);

        if (!string.IsNullOrWhiteSpace(input.Sorting))
            queryable = queryable.OrderBy(input.Sorting);
        else
            queryable = queryable.OrderBy(x => x.Orden);

        queryable = queryable.Skip(input.SkipCount).Take(input.MaxResultCount);
        var items = await AsyncExecuter.ToListAsync(queryable);

        return new PagedResultDto<LoteriaDto>(totalCount, ObjectMapper.Map<List<Loteria>, List<LoteriaDto>>(items));
    }

    protected override Task<Loteria> MapToEntityAsync(CrearActualizarLoteriaDto input)
    {
        return Task.FromResult(new Loteria(GuidGenerator.Create(), input.Nombre, input.CodigoCorto, input.Orden)
        {
            LogoUrl = input.LogoUrl,
            Activa = input.Activa
        });
    }

    protected override async Task MapToEntityAsync(CrearActualizarLoteriaDto input, Loteria entity)
    {
        entity.Nombre = input.Nombre;
        entity.CodigoCorto = input.CodigoCorto;
        entity.LogoUrl = input.LogoUrl;
        entity.Activa = input.Activa;
        entity.Orden = input.Orden;
        await Task.CompletedTask;
    }

    public async Task<LoteriaDto> ObtenerConSorteosAsync(Guid id)
    {
        var queryable = await Repository.WithDetailsAsync(l => l.Sorteos, l => l.ConfiguracionesPago);
        var loteria = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(l => l.Id == id));
        return ObjectMapper.Map<Loteria, LoteriaDto>(loteria!);
    }

    public async Task<List<LoteriaDto>> ObtenerActivasAsync()
    {
        var queryable = await Repository.WithDetailsAsync(l => l.Sorteos);
        var loterias = await AsyncExecuter.ToListAsync(
            queryable.Where(l => l.Activa).OrderBy(l => l.Orden));
        return ObjectMapper.Map<List<Loteria>, List<LoteriaDto>>(loterias);
    }
}
