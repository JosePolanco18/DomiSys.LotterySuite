using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.GestionEfectivo;

public interface IGestionEfectivoAppService : IApplicationService
{
    Task<MovimientoEfectivoDto> RegistrarEntregaAdminAsync(RegistrarTransferenciaDto input);
    Task<MovimientoEfectivoDto> RegistrarEntregaTerminalAsync(RegistrarTransferenciaDto input);
    Task<PagedResultDto<MovimientoEfectivoDto>> GetMovimientosAsync(Guid terminalId, PagedAndSortedResultRequestDto input);
    Task<List<ResumenEfectivoTerminalDto>> GetResumenTodasTerminalesAsync();
}
