using System;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Cuadres;

public interface ICuadreAppService : IApplicationService
{
    Task<CuadreTerminalDto> GenerarCuadreAsync(GenerarCuadreDto input);
    Task<CuadreTerminalDto> ObtenerAsync(Guid id);
    Task<PagedResultDto<CuadreTerminalDto>> GetListAsync(PagedAndFilteredResultRequestDto input);
    Task<PagedResultDto<CuadreTerminalDto>> ObtenerPorTerminalAsync(Guid terminalId, PagedAndSortedResultRequestDto input);
    Task<CuadreTerminalDto> ObtenerResumenTerminalAsync(Guid terminalId);
}
