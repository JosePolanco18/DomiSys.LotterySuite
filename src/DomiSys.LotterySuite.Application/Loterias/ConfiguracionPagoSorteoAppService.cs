using System;
using System.Linq;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Loterias;

[Authorize(LotterySuitePermissions.Loterias.Default)]
public class ConfiguracionPagoSorteoAppService : ApplicationService, IConfiguracionPagoSorteoAppService
{
    private readonly IRepository<ConfiguracionPagoSorteo, Guid> _repository;

    public ConfiguracionPagoSorteoAppService(IRepository<ConfiguracionPagoSorteo, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<ConfiguracionPagoSorteoDto> ObtenerPorSorteoAsync(Guid sorteoId)
    {
        var queryable = await _repository.WithDetailsAsync(c => c.Sorteo);
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(c => c.SorteoId == sorteoId));

        if (config == null)
        {
            // Auto-create with defaults if not found
            config = new ConfiguracionPagoSorteo(GuidGenerator.Create(), sorteoId);
            await _repository.InsertAsync(config, autoSave: true);

            queryable = await _repository.WithDetailsAsync(c => c.Sorteo);
            config = await AsyncExecuter.FirstOrDefaultAsync(
                queryable.Where(c => c.SorteoId == sorteoId));
        }

        return ObjectMapper.Map<ConfiguracionPagoSorteo, ConfiguracionPagoSorteoDto>(config!);
    }

    [Authorize(LotterySuitePermissions.Loterias.GestionLoterias.Edit)]
    public async Task<ConfiguracionPagoSorteoDto> ActualizarAsync(Guid sorteoId, CrearActualizarConfiguracionPagoSorteoDto input)
    {
        var queryable = await _repository.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(c => c.SorteoId == sorteoId));

        if (config == null)
        {
            config = new ConfiguracionPagoSorteo(GuidGenerator.Create(), sorteoId);
            await _repository.InsertAsync(config, autoSave: true);
        }

        config.QuinielaPrimera = input.QuinielaPrimera;
        config.QuinielaSegunda = input.QuinielaSegunda;
        config.QuinielaTercera = input.QuinielaTercera;
        config.PalePrimeraSegunda = input.PalePrimeraSegunda;
        config.PaleSegundaTercera = input.PaleSegundaTercera;
        config.Tripleta = input.Tripleta;
        config.SuperPale = input.SuperPale;

        await _repository.UpdateAsync(config, autoSave: true);

        var detailedQ = await _repository.WithDetailsAsync(c => c.Sorteo);
        var updated = await AsyncExecuter.FirstOrDefaultAsync(detailedQ.Where(c => c.Id == config.Id));
        return ObjectMapper.Map<ConfiguracionPagoSorteo, ConfiguracionPagoSorteoDto>(updated!);
    }
}
