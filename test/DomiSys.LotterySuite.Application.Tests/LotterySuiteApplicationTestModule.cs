using Volo.Abp.Modularity;

namespace DomiSys.LotterySuite;

[DependsOn(
    typeof(LotterySuiteApplicationModule),
    typeof(LotterySuiteDomainTestModule)
)]
public class LotterySuiteApplicationTestModule : AbpModule
{

}
