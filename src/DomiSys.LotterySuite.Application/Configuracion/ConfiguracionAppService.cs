using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Configuracion;

[Authorize]
public class ConfiguracionAppService : ApplicationService, IConfiguracionAppService
{
    private readonly IRepository<ConfiguracionGeneral, Guid> _repository;
    private readonly IConfiguracionGeneralManager _manager;

    public ConfiguracionAppService(
        IRepository<ConfiguracionGeneral, Guid> repository,
        IConfiguracionGeneralManager manager)
    {
        _repository = repository;
        _manager = manager;
    }

    public async Task<ConfiguracionGeneralDto> ObtenerAsync()
    {
        var config = await _manager.GetCurrentAsync();
        if (config == null)
        {
            return new ConfiguracionGeneralDto
            {
                ComisionVentaPorDefecto = 7m,
                ComisionVerdePorDefecto = 5m,
                MinutosVentanaAnulacion = 5,
                VendedorPuedeAnular = true,
                NombreEmpresa = "DomiSys Lottery",
                PieTicket = "Conserve este ticket",
                LimiteQuiniela = null,
                LimitePale = null,
                LimiteTripleta = null,
                LimiteSuperPale = null
            };
        }
        return MapToDto(config);
    }

    public async Task<ConfiguracionGeneralDto> ActualizarAsync(ConfiguracionGeneralDto input)
    {
        var config = await _manager.GetCurrentAsync();

        if (config == null)
        {
            var nueva = new ConfiguracionGeneral(
                input.ComisionVentaPorDefecto,
                input.ComisionVerdePorDefecto,
                input.MinutosVentanaAnulacion,
                input.VendedorPuedeAnular,
                input.NombreEmpresa,
                input.TelefonoEmpresa,
                input.PieTicket,
                input.LimiteQuiniela,
                input.LimitePale,
                input.LimiteTripleta,
                input.LimiteSuperPale);
            config = await _manager.CreateAsync(nueva);
        }
        else
        {
            config.Update(
                input.ComisionVentaPorDefecto,
                input.ComisionVerdePorDefecto,
                input.MinutosVentanaAnulacion,
                input.VendedorPuedeAnular,
                input.NombreEmpresa,
                input.TelefonoEmpresa,
                input.PieTicket,
                input.LimiteQuiniela,
                input.LimitePale,
                input.LimiteTripleta,
                input.LimiteSuperPale);
            await _repository.UpdateAsync(config);
        }

        return MapToDto(config);
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
            PieTicket = entity.PieTicket,
            LimiteQuiniela = entity.LimiteQuiniela,
            LimitePale = entity.LimitePale,
            LimiteTripleta = entity.LimiteTripleta,
            LimiteSuperPale = entity.LimiteSuperPale
        };
    }
}
