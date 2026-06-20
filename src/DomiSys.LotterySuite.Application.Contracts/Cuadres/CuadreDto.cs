using System;
using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.Cuadres;

public class CuadreTerminalDto : AuditedEntityDto<Guid>
{
    public Guid TerminalId { get; set; }
    public string NombreTerminal { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public DateTime FechaCuadre { get; set; }
    public DateTime PeriodoInicio { get; set; }
    public DateTime PeriodoFin { get; set; }
    public decimal VentasBrutas { get; set; }
    public decimal TotalPremiosPagados { get; set; }
    public decimal PorcentajeComisionVenta { get; set; }
    public decimal MontoComisionVenta { get; set; }
    public decimal PorcentajeComisionVerde { get; set; }
    public decimal MontoComisionVerde { get; set; }
    public decimal BalanceNeto { get; set; }
    public bool QuedoEnVerde { get; set; }
    public string? Notas { get; set; }
    public string CuadradoPor { get; set; } = string.Empty;
}

public class GenerarCuadreDto
{
    public Guid TerminalId { get; set; }
    public string? Notas { get; set; }
}
