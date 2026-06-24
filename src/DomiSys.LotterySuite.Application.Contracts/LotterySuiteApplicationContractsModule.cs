using Volo.Abp.Account;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;

namespace DomiSys.LotterySuite;

[DependsOn(
    typeof(LotterySuiteDomainSharedModule),
    typeof(AbpFeatureManagementApplicationContractsModule),
    typeof(AbpSettingManagementApplicationContractsModule),
    typeof(AbpIdentityApplicationContractsModule),
    typeof(AbpAccountApplicationContractsModule),
    typeof(AbpPermissionManagementApplicationContractsModule),
    typeof(Volo.Abp.TenantManagement.AbpTenantManagementApplicationContractsModule)
)]
public class LotterySuiteApplicationContractsModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        LotterySuiteDtoExtensions.Configure();
    }
}
