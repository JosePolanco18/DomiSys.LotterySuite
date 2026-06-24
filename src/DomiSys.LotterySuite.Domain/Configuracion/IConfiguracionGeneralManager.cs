using System.Threading.Tasks;
using Volo.Abp.Domain.Services;

namespace DomiSys.LotterySuite.Configuracion;

public interface IConfiguracionGeneralManager : IDomainService
{
    Task<ConfiguracionGeneral> CreateAsync(ConfiguracionGeneral config);
    Task<ConfiguracionGeneral?> GetCurrentAsync();
}
