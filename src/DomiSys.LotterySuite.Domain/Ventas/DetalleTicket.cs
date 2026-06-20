using System;
using DomiSys.LotterySuite.Loterias;
using Volo.Abp.Domain.Entities;

namespace DomiSys.LotterySuite.Ventas;

public class DetalleTicket : Entity<Guid>
{
    public Guid TicketId { get; set; }
    public Guid SorteoId { get; set; }
    public DateTime FechaSorteo { get; set; }
    public TipoJugada TipoJugada { get; set; }
    public int PrimerNumero { get; set; }
    public int? SegundoNumero { get; set; }
    public int? TercerNumero { get; set; }
    public Guid? SegundoSorteoId { get; set; }
    public decimal Monto { get; set; }
    public decimal MultiplicadorPago { get; set; }
    public decimal MontoPremio { get; set; }
    public bool EsGanador { get; set; }

    public virtual Ticket Ticket { get; set; } = null!;
    public virtual Sorteo Sorteo { get; set; } = null!;
    public virtual Sorteo? SegundoSorteo { get; set; }

    protected DetalleTicket() { }

    public DetalleTicket(
        Guid id,
        Guid ticketId,
        Guid sorteoId,
        DateTime fechaSorteo,
        TipoJugada tipoJugada,
        int primerNumero,
        decimal monto,
        decimal multiplicadorPago,
        int? segundoNumero = null,
        int? tercerNumero = null,
        Guid? segundoSorteoId = null) : base(id)
    {
        TicketId = ticketId;
        SorteoId = sorteoId;
        FechaSorteo = fechaSorteo;
        TipoJugada = tipoJugada;
        PrimerNumero = primerNumero;
        SegundoNumero = segundoNumero;
        TercerNumero = tercerNumero;
        SegundoSorteoId = segundoSorteoId;
        Monto = monto;
        MultiplicadorPago = multiplicadorPago;
    }

    public void MarcarComoGanador(decimal montoPremio, decimal multiplicadorUsado)
    {
        EsGanador = true;
        MontoPremio = montoPremio;
        MultiplicadorPago = multiplicadorUsado;
    }
}
