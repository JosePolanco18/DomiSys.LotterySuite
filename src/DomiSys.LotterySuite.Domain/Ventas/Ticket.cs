using System;
using System.Collections.Generic;
using System.Linq;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Terminales;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Ventas;

public class Ticket : AuditedEntity<Guid>
{
    public string CodigoTicket { get; set; } = string.Empty;
    public Guid TerminalId { get; set; }
    public DateTime FechaCreacion { get; set; }
    public EstadoTicket Estado { get; set; } = EstadoTicket.Activo;
    public decimal MontoTotal { get; set; }
    public decimal TotalPremios { get; set; }
    public DateTime? FechaPago { get; set; }
    public Guid? TerminalPagoId { get; set; }
    public DateTime? FechaAnulacion { get; set; }
    public string? AnuladoPor { get; set; }
    public string? MotivoAnulacion { get; set; }
    public string HashVerificacion { get; set; } = string.Empty;

    public virtual Terminal Terminal { get; set; } = null!;
    public virtual Terminal? TerminalPago { get; set; }
    public virtual ICollection<DetalleTicket> Detalles { get; set; } = new List<DetalleTicket>();

    protected Ticket() { }

    public Ticket(Guid id, string codigoTicket, Guid terminalId, DateTime fechaCreacion) : base(id)
    {
        CodigoTicket = codigoTicket;
        TerminalId = terminalId;
        FechaCreacion = fechaCreacion;
    }

    public void CalcularMontoTotal()
    {
        MontoTotal = Detalles.Sum(d => d.Monto);
    }

    public void CalcularPremios()
    {
        TotalPremios = Detalles.Where(d => d.EsGanador).Sum(d => d.MontoPremio);
        if (TotalPremios > 0)
            Estado = EstadoTicket.Ganador;
    }

    public void MarcarComoPagado(Guid terminalPagoId)
    {
        Estado = EstadoTicket.Pagado;
        FechaPago = DateTime.UtcNow;
        TerminalPagoId = terminalPagoId;
    }

    public void Anular(string anuladoPor, string? motivo = null)
    {
        Estado = EstadoTicket.Anulado;
        FechaAnulacion = DateTime.UtcNow;
        AnuladoPor = anuladoPor;
        MotivoAnulacion = motivo;
    }

    public bool EsAnulable() => Estado == EstadoTicket.Activo;
    public bool EsPagable() => Estado == EstadoTicket.Ganador;
}
