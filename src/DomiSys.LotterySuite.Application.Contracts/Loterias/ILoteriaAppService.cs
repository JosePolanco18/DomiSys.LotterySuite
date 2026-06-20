using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Loterias;

public interface ILoteriaAppService : ICrudAppService<LoteriaDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarLoteriaDto>
{
    Task<LoteriaDto> ObtenerConSorteosAsync(Guid id);
    Task<List<LoteriaDto>> ObtenerActivasAsync();
}

public interface ISorteoAppService : ICrudAppService<SorteoDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarSorteoDto>
{
    Task<List<SorteoDto>> ObtenerPorLoteriaAsync(Guid loteriaId);
    Task<List<SorteoDto>> ObtenerAbiertosAsync();
}

public interface IResultadoSorteoAppService : IApplicationService
{
    Task<ResultadoSorteoDto> RegistrarAsync(CrearResultadoSorteoDto input);
    Task<PagedResultDto<ResultadoSorteoDto>> ObtenerListaAsync(PagedAndSortedResultRequestDto input);
    Task<List<ResultadoSorteoDto>> ObtenerPorFechaAsync(DateTime fecha);
    Task<List<ResultadoSorteoDto>> ObtenerUltimosAsync(int cantidad = 10);
}

public interface IConfiguracionPagoAppService : ICrudAppService<ConfiguracionPagoDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarConfiguracionPagoDto>
{
    Task<List<ConfiguracionPagoDto>> ObtenerPorLoteriaAsync(Guid loteriaId);
}

public interface IConfiguracionPagoSorteoAppService : IApplicationService
{
    Task<ConfiguracionPagoSorteoDto> ObtenerPorSorteoAsync(Guid sorteoId);
    Task<ConfiguracionPagoSorteoDto> ActualizarAsync(Guid sorteoId, CrearActualizarConfiguracionPagoSorteoDto input);
}

public interface IConfiguracionMontoJugadaAppService : ICrudAppService<ConfiguracionMontoJugadaDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarConfiguracionMontoJugadaDto>
{
}
