using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Permissions;
using Microsoft.AspNetCore.Authorization;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.ControlRiesgo;

[Authorize(LotterySuitePermissions.ControlRiesgo.Default)]
public class LimiteNumeroAppService :
    CrudAppService<LimiteNumero, LimiteNumeroDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarLimiteNumeroDto>,
    ILimiteNumeroAppService
{
    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepository;

    public LimiteNumeroAppService(
        IRepository<LimiteNumero, Guid> repository,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepository) : base(repository)
    {
        _acumuladoRepository = acumuladoRepository;
        GetPolicyName = LotterySuitePermissions.ControlRiesgo.LimitesNumero.Default;
        GetListPolicyName = LotterySuitePermissions.ControlRiesgo.LimitesNumero.Default;
        CreatePolicyName = LotterySuitePermissions.ControlRiesgo.LimitesNumero.Create;
        UpdatePolicyName = LotterySuitePermissions.ControlRiesgo.LimitesNumero.Edit;
        DeletePolicyName = LotterySuitePermissions.ControlRiesgo.LimitesNumero.Delete;
    }

    public override async Task<PagedResultDto<LimiteNumeroDto>> GetListAsync(PagedAndFilteredResultRequestDto input)
    {
        var queryable = await Repository.WithDetailsAsync(l => l.Loteria, l => l.Sorteo);
        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var f = input.Filter.ToLower();
            queryable = queryable.Where(x =>
                x.Loteria.Nombre.ToLower().Contains(f) ||
                x.Sorteo.Nombre.ToLower().Contains(f));
        }
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        queryable = !string.IsNullOrWhiteSpace(input.Sorting)
            ? queryable.OrderBy(input.Sorting)
            : queryable.OrderBy(x => x.Numero);
        var items = await AsyncExecuter.ToListAsync(queryable.Skip(input.SkipCount).Take(input.MaxResultCount));
        return new PagedResultDto<LimiteNumeroDto>(totalCount, ObjectMapper.Map<List<LimiteNumero>, List<LimiteNumeroDto>>(items));
    }

    protected override Task<LimiteNumero> MapToEntityAsync(CrearActualizarLimiteNumeroDto input)
    {
        var entity = new LimiteNumero(
            GuidGenerator.Create(),
            input.LoteriaId,
            input.SorteoId,
            input.Numero,
            input.LimiteVentaMaximo,
            input.LimiteAguante
        );
        entity.Bloqueado = input.Bloqueado;
        entity.Notas = input.Notas;
        return Task.FromResult(entity);
    }

    protected override async Task MapToEntityAsync(CrearActualizarLimiteNumeroDto input, LimiteNumero entity)
    {
        entity.LoteriaId = input.LoteriaId;
        entity.SorteoId = input.SorteoId;
        entity.Numero = input.Numero;
        entity.LimiteVentaMaximo = input.LimiteVentaMaximo;
        entity.LimiteAguante = input.LimiteAguante;
        entity.Bloqueado = input.Bloqueado;
        entity.Notas = input.Notas;
        await Task.CompletedTask;
    }

    public async Task<List<LimiteNumeroDto>> ObtenerPorSorteoAsync(Guid sorteoId)
    {
        var queryable = await Repository.WithDetailsAsync(l => l.Loteria, l => l.Sorteo);
        var limites = await AsyncExecuter.ToListAsync(
            queryable.Where(l => l.SorteoId == sorteoId).OrderBy(l => l.Numero));
        return ObjectMapper.Map<List<LimiteNumero>, List<LimiteNumeroDto>>(limites);
    }

    public async Task<List<AcumuladoVentaNumeroDto>> ObtenerAcumuladosAsync(Guid sorteoId, DateTime fecha)
    {
        var fechaBuscar = fecha.Date;
        var acumuladoQueryable = await _acumuladoRepository.GetQueryableAsync();
        var acumulados = await AsyncExecuter.ToListAsync(
            acumuladoQueryable.Where(a => a.SorteoId == sorteoId && a.Fecha.Date == fechaBuscar)
                .OrderBy(a => a.Numero));

        var limiteQueryable = await Repository.WithDetailsAsync(l => l.Loteria, l => l.Sorteo);
        var limites = await AsyncExecuter.ToListAsync(
            limiteQueryable.Where(l => l.SorteoId == sorteoId));

        return acumulados.Select(a =>
        {
            var limite = limites.FirstOrDefault(l => l.Numero == a.Numero);
            return new AcumuladoVentaNumeroDto
            {
                SorteoId = a.SorteoId,
                NombreSorteo = limite?.Sorteo?.Nombre ?? string.Empty,
                NombreLoteria = limite?.Loteria?.Nombre ?? string.Empty,
                Fecha = a.Fecha,
                Numero = a.Numero,
                MontoAcumulado = a.MontoAcumulado,
                LimiteVentaMaximo = limite?.LimiteVentaMaximo ?? 0,
                LimiteAguante = limite?.LimiteAguante ?? 0,
                Disponible = (limite?.LimiteVentaMaximo ?? 0) - a.MontoAcumulado,
                ExcedenteAguante = limite != null ? limite.ExcedenteAguante(a.MontoAcumulado) : 0
            };
        }).ToList();
    }

    public async Task<List<AcumuladoVentaNumeroDto>> ObtenerExcedentesAguanteAsync(DateTime fecha)
    {
        var acumulados = await ObtenerTodosAcumuladosDelDiaAsync(fecha);
        return acumulados.Where(a => a.ExcedenteAguante > 0).ToList();
    }

    private async Task<List<AcumuladoVentaNumeroDto>> ObtenerTodosAcumuladosDelDiaAsync(DateTime fecha)
    {
        var acumuladoQueryable = await _acumuladoRepository.GetQueryableAsync();
        var acumulados = await AsyncExecuter.ToListAsync(
            acumuladoQueryable.Where(a => a.Fecha == fecha.Date));

        var sorteoIds = acumulados.Select(a => a.SorteoId).Distinct().ToList();

        var limiteQueryable = await Repository.WithDetailsAsync(l => l.Loteria, l => l.Sorteo);
        var limites = await AsyncExecuter.ToListAsync(
            limiteQueryable.Where(l => sorteoIds.Contains(l.SorteoId)));

        return acumulados.Select(a =>
        {
            var limite = limites.FirstOrDefault(l => l.SorteoId == a.SorteoId && l.Numero == a.Numero);
            return new AcumuladoVentaNumeroDto
            {
                SorteoId = a.SorteoId,
                NombreSorteo = limite?.Sorteo?.Nombre ?? string.Empty,
                NombreLoteria = limite?.Loteria?.Nombre ?? string.Empty,
                Fecha = a.Fecha,
                Numero = a.Numero,
                MontoAcumulado = a.MontoAcumulado,
                LimiteVentaMaximo = limite?.LimiteVentaMaximo ?? 0,
                LimiteAguante = limite?.LimiteAguante ?? 0,
                Disponible = (limite?.LimiteVentaMaximo ?? 0) - a.MontoAcumulado,
                ExcedenteAguante = limite != null ? limite.ExcedenteAguante(a.MontoAcumulado) : 0
            };
        }).ToList();
    }
}
