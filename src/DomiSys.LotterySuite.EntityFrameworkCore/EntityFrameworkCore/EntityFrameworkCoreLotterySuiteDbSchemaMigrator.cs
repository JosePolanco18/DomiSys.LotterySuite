using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using DomiSys.LotterySuite.Data;
using Volo.Abp.DependencyInjection;

namespace DomiSys.LotterySuite.EntityFrameworkCore;

public class EntityFrameworkCoreLotterySuiteDbSchemaMigrator
    : ILotterySuiteDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreLotterySuiteDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the LotterySuiteDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<LotterySuiteDbContext>()
            .Database
            .MigrateAsync();
    }
}
