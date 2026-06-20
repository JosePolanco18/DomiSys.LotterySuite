using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Configuracion;

public interface IConfiguracionAppService : IApplicationService
{
    Task<ConfiguracionGeneralDto> ObtenerAsync();
    Task<ConfiguracionGeneralDto> ActualizarAsync(ConfiguracionGeneralDto input);
}
