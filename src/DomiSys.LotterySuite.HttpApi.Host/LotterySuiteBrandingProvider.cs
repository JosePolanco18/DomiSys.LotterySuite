using Microsoft.Extensions.Localization;
using DomiSys.LotterySuite.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace DomiSys.LotterySuite;

[Dependency(ReplaceServices = true)]
public class LotterySuiteBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<LotterySuiteResource> _localizer;

    public LotterySuiteBrandingProvider(IStringLocalizer<LotterySuiteResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
