using System;
using System.Collections.Generic;
using DomiSys.LotterySuite.Loterias;
using Volo.Abp.Application.Dtos;

namespace DomiSys.LotterySuite.Ventas;

public class TicketDto : AuditedEntityDto<Guid>
{
    public string CodigoTicket { get; set; } = string.Empty;
    public Guid TerminalId { get; set; }
    public string NombreTerminal { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public EstadoTicket Estado { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal TotalPremios { get; set; }
    public DateTime? FechaPago { get; set; }
    public DateTime? FechaAnulacion { get; set; }
    public string? AnuladoPor { get; set; }
    public string? MotivoAnulacion { get; set; }
    public List<DetalleTicketDto> Detalles { get; set; } = new();
}

public class DetalleTicketDto
{
    public Guid Id { get; set; }
    public Guid SorteoId { get; set; }
    public string NombreSorteo { get; set; } = string.Empty;
    public string NombreLoteria { get; set; } = string.Empty;
    public DateTime FechaSorteo { get; set; }
    public TipoJugada TipoJugada { get; set; }
    public int PrimerNumero { get; set; }
    public int? SegundoNumero { get; set; }
    public int? TercerNumero { get; set; }
    public Guid? SegundoSorteoId { get; set; }
    public string? NombreSegundoSorteo { get; set; }
    public decimal Monto { get; set; }
    public decimal MultiplicadorPago { get; set; }
    public decimal MontoPremio { get; set; }
    public bool EsGanador { get; set; }
}

public class CrearTicketDto
{
    public List<CrearDetalleTicketDto> Detalles { get; set; } = new();
}

public class CrearTicketAdminDto
{
    public Guid TerminalId { get; set; }
    public List<CrearDetalleTicketDto> Detalles { get; set; } = new();
}

public class CrearDetalleTicketDto
{
    public Guid SorteoId { get; set; }
    public TipoJugada TipoJugada { get; set; }
    public int PrimerNumero { get; set; }
    public int? SegundoNumero { get; set; }
    public int? TercerNumero { get; set; }
    public Guid? SegundoSorteoId { get; set; }
    public decimal Monto { get; set; }
}

public class AnularTicketDto
{
    public string? MotivoAnulacion { get; set; }
}
