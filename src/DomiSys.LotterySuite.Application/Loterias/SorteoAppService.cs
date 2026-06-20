using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Permissions;
using Microsoft.AspNetCore.Authorization;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Loterias;

[Authorize(LotterySuitePermissions.Loterias.Default)]
public class SorteoAppService :
    CrudAppService<Sorteo, SorteoDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarSorteoDto>,
    ISorteoAppService
{
    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    public SorteoAppService(IRepository<Sorteo, Guid> repository) : base(repository)
    {
        GetPolicyName = LotterySuitePermissions.Loterias.Sorteos.Default;
        GetListPolicyName = LotterySuitePermissions.Loterias.Sorteos.Default;
        CreatePolicyName = LotterySuitePermissions.Loterias.Sorteos.Create;
        UpdatePolicyName = LotterySuitePermissions.Loterias.Sorteos.Edit;
        DeletePolicyName = LotterySuitePermissions.Loterias.Sorteos.Delete;
    }

    public override async Task<PagedResultDto<SorteoDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await Repository.WithDetailsAsync(s => s.Loteria);
        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(x =>
                x.Nombre.ToLower().Contains(f) ||
                x.Loteria.Nombre.ToLower().Contains(f));
        }
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        queryable = !string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderBy(input.Sorting)
            : queryable.OrderBy(x => x.Loteria.Orden).ThenBy(x => x.HoraSorteo);
        var items = await AsyncExecuter.ToListAsync(queryable.Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<SorteoDto>(totalCount, MapSorteosConEstado(items));
    }

    protected override Task<Sorteo> MapToEntityAsync(CrearActualizarSorteoDto input)
    {
        return Task.FromResult(new Sorteo(
            GuidGenerator.Create(),
            input.LoteriaId,
            input.Nombre,
            input.DiasActivos,
            input.HoraAperturaVentas,
            input.HoraCierreVentas,
            input.HoraSorteo,
            input.MinutosEsperaScraping
        ) { Activo = input.Activo });
    }

    protected override async Task MapToEntityAsync(CrearActualizarSorteoDto input, Sorteo entity)
    {
        entity.LoteriaId = input.LoteriaId;
        entity.Nombre = input.Nombre;
        entity.DiasActivos = input.DiasActivos;
        entity.HoraAperturaVentas = input.HoraAperturaVentas;
        entity.HoraCierreVentas = input.HoraCierreVentas;
        entity.HoraSorteo = input.HoraSorteo;
        entity.MinutosEsperaScraping = input.MinutosEsperaScraping;
        entity.Activo = input.Activo;
        await Task.CompletedTask;
    }

    public async Task<List<SorteoDto>> ObtenerPorLoteriaAsync(Guid loteriaId)
    {
        var queryable = await Repository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(
            queryable.Where(s => s.LoteriaId == loteriaId));
        return MapSorteosConEstado(sorteos);
    }

    public async Task<List<SorteoDto>> ObtenerAbiertosAsync()
    {
        var queryable = await Repository.WithDetailsAsync(s => s.Loteria);
        var sorteos = await AsyncExecuter.ToListAsync(
            queryable.Where(s => s.Activo && s.Loteria.Activa));
        return MapSorteosConEstado(sorteos.Where(s => s.EstaAbiertoParaVentas(ObtenerHoraRD())).ToList());
    }

    private List<SorteoDto> MapSorteosConEstado(List<Sorteo> sorteos)
    {
        var ahora = ObtenerHoraRD();
        var dtos = ObjectMapper.Map<List<Sorteo>, List<SorteoDto>>(sorteos);
        for (int i = 0; i < sorteos.Count; i++)
        {
            dtos[i].EstaAbierto = sorteos[i].EstaAbiertoParaVentas(ahora);
        }
        return dtos;
    }

    private static DateTime ObtenerHoraRD() =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaRd);
}
