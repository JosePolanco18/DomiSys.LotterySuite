using DomiSys.LotterySuite.Samples;
using Xunit;

namespace DomiSys.LotterySuite.EntityFrameworkCore.Domains;

[Collection(LotterySuiteTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<LotterySuiteEntityFrameworkCoreTestModule>
{

}
