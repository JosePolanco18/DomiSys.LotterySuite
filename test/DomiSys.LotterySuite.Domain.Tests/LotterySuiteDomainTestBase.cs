using Volo.Abp.Modularity;

namespace DomiSys.LotterySuite;

/* Inherit from this class for your domain layer tests. */
public abstract class LotterySuiteDomainTestBase<TStartupModule> : LotterySuiteTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
