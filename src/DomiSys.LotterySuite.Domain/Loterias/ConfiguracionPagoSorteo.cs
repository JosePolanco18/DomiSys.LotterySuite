using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.Loterias;

public class ConfiguracionPagoSorteo : AuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid SorteoId { get; set; }

    // Quiniela - pago por peso apostado segun posicion
    public decimal QuinielaPrimera { get; set; } = 60;
    public decimal QuinielaSegunda { get; set; } = 40;
    public decimal QuinielaTercera { get; set; } = 20;

    // Pale - pago por peso apostado segun combinacion de posiciones
    public decimal PalePrimeraSegunda { get; set; } = 1000;
    public decimal PalePrimeraTercera { get; set; } = 800;
    public decimal PaleSegundaTercera { get; set; } = 500;

    // Tripleta
    public decimal Tripleta { get; set; } = 100000;

    // Super Pale (ambos en primera en sus respectivas loterias)
    public decimal SuperPale { get; set; } = 1000;

    public virtual Sorteo Sorteo { get; set; } = null!;

    protected ConfiguracionPagoSorteo() { }

    public ConfiguracionPagoSorteo(Guid id, Guid sorteoId) : base(id)
    {
        SorteoId = sorteoId;
    }
}
