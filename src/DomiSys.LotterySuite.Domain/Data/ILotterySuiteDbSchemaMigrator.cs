using System.Threading.Tasks;

namespace DomiSys.LotterySuite.Data;

public interface ILotterySuiteDbSchemaMigrator
{
    Task MigrateAsync();
}
