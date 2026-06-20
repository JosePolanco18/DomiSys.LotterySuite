using System;
using DomiSys.LotterySuite.Loterias;
using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.Terminales;

public class TerminalDto : AuditedEntityDto<Guid>
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public EstadoTerminal Estado { get; set; }
    public decimal? PorcentajeComisionVenta { get; set; }
    public decimal? PorcentajeComisionVerde { get; set; }
    public string? Ubicacion { get; set; }
    public string? Telefono { get; set; }
    public string? Notas { get; set; }
    public DateTime? UltimaActividad { get; set; }
}

public class CrearActualizarTerminalDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public string? Pin { get; set; }
    public decimal? PorcentajeComisionVenta { get; set; }
    public decimal? PorcentajeComisionVerde { get; set; }
    public string? Ubicacion { get; set; }
    public string? Telefono { get; set; }
    public string? Notas { get; set; }
}
