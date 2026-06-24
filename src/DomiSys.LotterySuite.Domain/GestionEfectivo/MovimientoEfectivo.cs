using System;
using DomiSys.LotterySuite.Terminales;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.GestionEfectivo;

public class MovimientoEfectivo : AuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid TerminalId { get; set; }
    public TipoMovimientoEfectivo Tipo { get; set; }
    public decimal Monto { get; set; }
    public decimal SaldoAnterior { get; set; }
    public decimal SaldoNuevo { get; set; }
    public Guid? ReferenciaId { get; set; }
    public string? Notas { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
    public DateTime FechaMovimiento { get; set; }

    public virtual Terminal Terminal { get; set; } = null!;

    protected MovimientoEfectivo() { }

    public MovimientoEfectivo(
        Guid terminalId,
        TipoMovimientoEfectivo tipo,
        decimal monto,
        decimal saldoAnterior,
        decimal saldoNuevo,
        string registradoPor,
        Guid? referenciaId = null,
        string? notas = null)
    {
        TerminalId = terminalId;
        Tipo = tipo;
        Monto = monto;
        SaldoAnterior = saldoAnterior;
        SaldoNuevo = saldoNuevo;
        RegistradoPor = registradoPor;
        ReferenciaId = referenciaId;
        Notas = notas;
        FechaMovimiento = DateTime.UtcNow;
    }
}
