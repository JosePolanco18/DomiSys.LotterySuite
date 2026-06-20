using Xunit;

namespace DomiSys.LotterySuite.EntityFrameworkCore;

[CollectionDefinition(LotterySuiteTestConsts.CollectionDefinitionName)]
public class LotterySuiteEntityFrameworkCoreCollection : ICollectionFixture<LotterySuiteEntityFrameworkCoreFixture>
{

}
