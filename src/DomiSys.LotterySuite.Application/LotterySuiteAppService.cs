using DomiSys.LotterySuite.Localization;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite;

/* Inherit your application services from this class.
 */
public abstract class LotterySuiteAppService : ApplicationService
{
    protected LotterySuiteAppService()
    {
        LocalizationResource = typeof(LotterySuiteResource);
    }
}
