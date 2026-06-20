using Volo.Abp.Modularity;

namespace DomiSys.LotterySuite;

[DependsOn(
    typeof(LotterySuiteDomainModule),
    typeof(LotterySuiteTestBaseModule)
)]
public class LotterySuiteDomainTestModule : AbpModule
{

}
