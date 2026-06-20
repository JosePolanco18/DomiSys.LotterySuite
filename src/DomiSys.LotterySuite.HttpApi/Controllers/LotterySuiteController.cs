using DomiSys.LotterySuite.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace DomiSys.LotterySuite.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class LotterySuiteController : AbpControllerBase
{
    protected LotterySuiteController()
    {
        LocalizationResource = typeof(LotterySuiteResource);
    }
}
