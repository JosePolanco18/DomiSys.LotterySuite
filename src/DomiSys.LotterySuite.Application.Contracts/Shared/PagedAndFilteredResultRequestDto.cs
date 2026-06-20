using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.Shared;

public class PagedAndFilteredResultRequestDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
}
