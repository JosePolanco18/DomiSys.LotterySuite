using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace DomiSys.LotterySuite.Configuracion;

public class ConfiguracionGeneralManager : DomainService, IConfiguracionGeneralManager
{
    private readonly IRepository<ConfiguracionGeneral, Guid> _repository;

    public ConfiguracionGeneralManager(IRepository<ConfiguracionGeneral, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<ConfiguracionGeneral> CreateAsync(ConfiguracionGeneral config)
    {
        Check.NotNull(config, nameof(config));
        return await _repository.InsertAsync(config);
    }

    public async Task<ConfiguracionGeneral?> GetCurrentAsync()
    {
        return await _repository.FirstOrDefaultAsync(x => true);
    }
}
