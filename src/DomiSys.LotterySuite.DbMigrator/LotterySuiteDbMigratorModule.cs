using DomiSys.LotterySuite.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace DomiSys.LotterySuite.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(LotterySuiteEntityFrameworkCoreModule),
    typeof(LotterySuiteApplicationContractsModule)
)]
public class LotterySuiteDbMigratorModule : AbpModule
{
}
