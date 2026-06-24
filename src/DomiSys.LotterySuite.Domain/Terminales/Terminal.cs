using System;
using System.Collections.Generic;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Ventas;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.Terminales;

public class Terminal : AuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public string PinVendedor { get; set; } = string.Empty;
    public EstadoTerminal Estado { get; set; } = EstadoTerminal.Activa;
    public decimal? PorcentajeComisionVenta { get; set; }
    public decimal? PorcentajeComisionVerde { get; set; }
    public string? Ubicacion { get; set; }
    public string? Telefono { get; set; }
    public string? Notas { get; set; }
    public DateTime? UltimaActividad { get; set; }
    public decimal? LimiteVentaDiaria { get; set; }
    public decimal? LimiteCuadre { get; set; }
    public bool PuedePagarGanadores { get; set; }
    public decimal SaldoEfectivo { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    protected Terminal() { }

    public Terminal(
        Guid id,
        string codigo,
        string nombre,
        string nombreVendedor,
        string pinVendedor) : base(id)
    {
        Codigo = codigo;
        Nombre = nombre;
        NombreVendedor = nombreVendedor;
        PinVendedor = pinVendedor;
    }

    public void Suspender() => Estado = EstadoTerminal.Suspendida;
    public void Activar() => Estado = EstadoTerminal.Activa;
    public void Bloquear() => Estado = EstadoTerminal.Bloqueada;
    public bool EstaActiva() => Estado == EstadoTerminal.Activa;

    public void RegistrarActividad() => UltimaActividad = DateTime.UtcNow;
    public void ActualizarSaldo(decimal monto) => SaldoEfectivo += monto;
}
