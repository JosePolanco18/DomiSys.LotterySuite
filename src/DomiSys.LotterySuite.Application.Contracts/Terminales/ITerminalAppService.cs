using System;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Shared;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Terminales;

public interface ITerminalAppService : ICrudAppService<TerminalDto, Guid, PagedAndFilteredResultRequestDto, CrearActualizarTerminalDto>
{
    Task<TerminalDto> ActivarAsync(Guid id);
    Task<TerminalDto> SuspenderAsync(Guid id);
    Task<TerminalDto> BloquearAsync(Guid id);
}
