using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Configuracion;

[Authorize]
public class ConfiguracionAppService : ApplicationService, IConfiguracionAppService
{
    private readonly IRepository<ConfiguracionGeneral, Guid> _repository;

    public ConfiguracionAppService(IRepository<ConfiguracionGeneral, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<ConfiguracionGeneralDto> ObtenerAsync()
    {
        var config = await ObtenerOCrearAsync();
        return MapToDto(config);
    }

    public async Task<ConfiguracionGeneralDto> ActualizarAsync(ConfiguracionGeneralDto input)
    {
        var config = await ObtenerOCrearAsync();
        config.ComisionVentaPorDefecto = input.ComisionVentaPorDefecto;
        config.ComisionVerdePorDefecto = input.ComisionVerdePorDefecto;
        config.MinutosVentanaAnulacion = input.MinutosVentanaAnulacion;
        config.VendedorPuedeAnular = input.VendedorPuedeAnular;
        config.NombreEmpresa = input.NombreEmpresa;
        config.TelefonoEmpresa = input.TelefonoEmpresa;
        config.PieTicket = input.PieTicket;
        await _repository.UpdateAsync(config, autoSave: true);
        return MapToDto(config);
    }

    private async Task<ConfiguracionGeneral> ObtenerOCrearAsync()
    {
        var queryable = await _repository.GetQueryableAsync();
        var config = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(c => c.Id == ConfiguracionGeneral.SingletonId));

        if (config == null)
        {
            config = new ConfiguracionGeneral(ConfiguracionGeneral.SingletonId);
            await _repository.InsertAsync(config, autoSave: true);
        }

        return config;
    }

    private static ConfiguracionGeneralDto MapToDto(ConfiguracionGeneral entity)
    {
        return new ConfiguracionGeneralDto
        {
            ComisionVentaPorDefecto = entity.ComisionVentaPorDefecto,
            ComisionVerdePorDefecto = entity.ComisionVerdePorDefecto,
            MinutosVentanaAnulacion = entity.MinutosVentanaAnulacion,
            VendedorPuedeAnular = entity.VendedorPuedeAnular,
            NombreEmpresa = entity.NombreEmpresa,
            TelefonoEmpresa = entity.TelefonoEmpresa,
            PieTicket = entity.PieTicket
        };
    }
}
