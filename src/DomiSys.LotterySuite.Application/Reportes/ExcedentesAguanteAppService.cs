using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Loterias;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Reportes;

[Authorize]
public class ExcedentesAguanteAppService : ApplicationService
{
    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepo;
    private readonly IRepository<LimiteNumero, Guid> _limiteRepo;
    private readonly IRepository<Loteria, Guid> _loteriaRepo;
    private readonly IRepository<Sorteo, Guid> _sorteoRepo;

    public ExcedentesAguanteAppService(
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepo,
        IRepository<LimiteNumero, Guid> limiteRepo,
        IRepository<Loteria, Guid> loteriaRepo,
        IRepository<Sorteo, Guid> sorteoRepo)
    {
        _acumuladoRepo = acumuladoRepo;
        _limiteRepo = limiteRepo;
        _loteriaRepo = loteriaRepo;
        _sorteoRepo = sorteoRepo;
    }

    public async Task<ExcedentesAguanteReporteDto> GenerarAsync(ExcedentesAguanteParametrosDto input)
    {
        var fecha = input.Fecha.Date;

        // Get all acumulados for the date
        var acumQuery = await _acumuladoRepo.GetQueryableAsync();
        var acumulados = await AsyncExecuter.ToListAsync(
            acumQuery.Where(a => a.Fecha.Date == fecha));

        // Get all limites with navigation properties
        var limiteQuery = await _limiteRepo.GetQueryableAsync();
        var limites = await AsyncExecuter.ToListAsync(limiteQuery);

        // Filter by loteria/sorteo if provided
        if (input.LoteriaId.HasValue)
            limites = limites.Where(l => l.LoteriaId == input.LoteriaId.Value).ToList();
        if (input.SorteoId.HasValue)
            limites = limites.Where(l => l.SorteoId == input.SorteoId.Value).ToList();

        // Load Loteria and Sorteo names
        var loteriaIds = limites.Select(l => l.LoteriaId).Distinct().ToList();
        var sorteoIds = limites.Select(l => l.SorteoId).Distinct().ToList();

        var loterias = await _loteriaRepo.GetListAsync(l => loteriaIds.Contains(l.Id));
        var sorteos = await _sorteoRepo.GetListAsync(s => sorteoIds.Contains(s.Id));

        var loteriaMap = loterias.ToDictionary(l => l.Id, l => l.Nombre);
        var sorteoMap = sorteos.ToDictionary(s => s.Id, s => s.Nombre);

        var items = new List<ExcedentesAguanteItemDto>();

        foreach (var acum in acumulados)
        {
            var limite = limites.FirstOrDefault(l => l.SorteoId == acum.SorteoId && l.Numero == acum.Numero);
            if (limite == null) continue;

            var excedente = limite.ExcedenteAguante(acum.MontoAcumulado);
            if (excedente <= 0) continue; // Only show numbers that exceeded aguante

            items.Add(new ExcedentesAguanteItemDto
            {
                NombreLoteria = loteriaMap.GetValueOrDefault(limite.LoteriaId, ""),
                NombreSorteo = sorteoMap.GetValueOrDefault(limite.SorteoId, ""),
                Numero = acum.Numero,
                LimiteVentaMaximo = limite.LimiteVentaMaximo,
                LimiteAguante = limite.LimiteAguante,
                MontoVendido = acum.MontoAcumulado,
                ExcedenteAguante = excedente,
                Disponible = limite.LimiteVentaMaximo - acum.MontoAcumulado,
                PorcentajeUso = limite.LimiteVentaMaximo > 0
                    ? (acum.MontoAcumulado / limite.LimiteVentaMaximo) * 100
                    : 0
            });
        }

        // Get filter display names
        string filtroLoteria = "Todas";
        string filtroSorteo = "Todos";
        if (input.LoteriaId.HasValue && loteriaMap.TryGetValue(input.LoteriaId.Value, out var lotNombre))
        {
            filtroLoteria = lotNombre;
        }
        if (input.SorteoId.HasValue && sorteoMap.TryGetValue(input.SorteoId.Value, out var sortNombre))
        {
            filtroSorteo = sortNombre;
        }

        return new ExcedentesAguanteReporteDto
        {
            Fecha = fecha,
            FiltroLoteria = filtroLoteria,
            FiltroSorteo = filtroSorteo,
            Items = items.OrderByDescending(i => i.ExcedenteAguante).ToList(),
            TotalExcedente = items.Sum(i => i.ExcedenteAguante),
            CantidadNumeros = items.Count
        };
    }
}
