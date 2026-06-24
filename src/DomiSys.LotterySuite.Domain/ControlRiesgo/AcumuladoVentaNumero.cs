using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.ControlRiesgo;

public class AcumuladoVentaNumero : Entity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid SorteoId { get; set; }
    public DateTime Fecha { get; set; }
    public int Numero { get; set; }
    public decimal MontoAcumulado { get; set; }
    public DateTime UltimaActualizacion { get; set; }

    protected AcumuladoVentaNumero() { }

    public AcumuladoVentaNumero(Guid id, Guid sorteoId, DateTime fecha, int numero) : base(id)
    {
        SorteoId = sorteoId;
        Fecha = fecha.Date;
        Numero = numero;
        MontoAcumulado = 0;
        UltimaActualizacion = DateTime.UtcNow;
    }
}
