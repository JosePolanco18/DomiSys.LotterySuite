using DomiSys.LotterySuite.Samples;
using Xunit;

namespace DomiSys.LotterySuite.EntityFrameworkCore.Applications;

[Collection(LotterySuiteTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<LotterySuiteEntityFrameworkCoreTestModule>
{

}
