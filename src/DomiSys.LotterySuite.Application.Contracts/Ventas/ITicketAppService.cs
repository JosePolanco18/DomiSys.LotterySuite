using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Ventas;

public interface ITicketAppService : IApplicationService
{
    Task<TicketDto> ProcesarVentaAsync(CrearTicketDto input);
    Task<TicketDto> ProcesarVentaAdminAsync(CrearTicketAdminDto input);
    Task<TicketDto> AnularTicketAsync(Guid id, AnularTicketDto input);
    Task<TicketDto> PagarGanadorAsync(Guid id);
    Task<TicketDto> ObtenerPorCodigoAsync(string codigoTicket);
    Task<TicketDto> ObtenerAsync(Guid id);
    Task<PagedResultDto<TicketDto>> GetListAsync(PagedAndFilteredResultRequestDto input);
    Task<List<TicketDto>> ObtenerGanadoresAsync();
    Task<PagedResultDto<TicketDto>> ObtenerPorTerminalAsync(Guid terminalId, PagedAndSortedResultRequestDto input);
}
