using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.ControlRiesgo;

public interface ILimiteNumeroAppService : ICrudAppService<LimiteNumeroDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarLimiteNumeroDto>
{
    Task<List<LimiteNumeroDto>> ObtenerPorSorteoAsync(Guid sorteoId);
    Task<List<AcumuladoVentaNumeroDto>> ObtenerAcumuladosAsync(Guid sorteoId, DateTime fecha);
    Task<List<AcumuladoVentaNumeroDto>> ObtenerExcedentesAguanteAsync(DateTime fecha);
    Task<ResultadoLimitesMasivosDto> AsignarLimitesMasivosAsync(AplicarLimitesMasivosDto input);
}
