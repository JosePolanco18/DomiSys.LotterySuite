using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Reportes;

public interface IDashboardAppService : IApplicationService
{
    Task<DashboardDto> ObtenerDashboardAsync();
}
