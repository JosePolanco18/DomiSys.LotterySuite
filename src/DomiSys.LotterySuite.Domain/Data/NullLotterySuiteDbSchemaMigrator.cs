using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace DomiSys.LotterySuite.Data;

/* This is used if database provider does't define
 * ILotterySuiteDbSchemaMigrator implementation.
 */
public class NullLotterySuiteDbSchemaMigrator : ILotterySuiteDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
