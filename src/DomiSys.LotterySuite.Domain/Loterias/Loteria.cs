using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.Loterias;

public class Loteria : AuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string CodigoCorto { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool Activa { get; set; } = true;
    public int Orden { get; set; }

    public virtual ICollection<Sorteo> Sorteos { get; set; } = new List<Sorteo>();
    public virtual ICollection<ConfiguracionPago> ConfiguracionesPago { get; set; } = new List<ConfiguracionPago>();

    protected Loteria() { }

    public Loteria(Guid id, string nombre, string codigoCorto, int orden = 0) : base(id)
    {
        Nombre = nombre;
        CodigoCorto = codigoCorto;
        Orden = orden;
    }
}
