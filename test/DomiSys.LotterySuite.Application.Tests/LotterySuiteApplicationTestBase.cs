using Volo.Abp.Modularity;

namespace DomiSys.LotterySuite;

public abstract class LotterySuiteApplicationTestBase<TStartupModule> : LotterySuiteTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
