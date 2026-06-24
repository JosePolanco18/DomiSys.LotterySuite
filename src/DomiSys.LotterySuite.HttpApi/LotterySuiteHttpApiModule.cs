using Localization.Resources.AbpUi;
using DomiSys.LotterySuite.Localization;
using Volo.Abp.Account;
using Volo.Abp.SettingManagement;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement.HttpApi;
using Volo.Abp.Localization;

namespace DomiSys.LotterySuite;

 [DependsOn(
    typeof(LotterySuiteApplicationContractsModule),
    typeof(AbpPermissionManagementHttpApiModule),
    typeof(AbpSettingManagementHttpApiModule),
    typeof(AbpAccountHttpApiModule),
    typeof(AbpIdentityHttpApiModule),
    typeof(AbpFeatureManagementHttpApiModule),
    typeof(Volo.Abp.TenantManagement.AbpTenantManagementHttpApiModule)
    )]
public class LotterySuiteHttpApiModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        ConfigureLocalization();
    }

    private void ConfigureLocalization()
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<LotterySuiteResource>()
                .AddBaseTypes(
                    typeof(AbpUiResource)
                );
        });
    }
}
