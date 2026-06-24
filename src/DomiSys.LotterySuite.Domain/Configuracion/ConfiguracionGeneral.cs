using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace DomiSys.LotterySuite.Configuracion;

public class ConfiguracionGeneral : AuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }

    public decimal ComisionVentaPorDefecto { get; set; }
    public decimal ComisionVerdePorDefecto { get; set; }
    public int MinutosVentanaAnulacion { get; set; }
    public bool VendedorPuedeAnular { get; set; }
    public string NombreEmpresa { get; set; } = string.Empty;
    public string? TelefonoEmpresa { get; set; }
    public string? PieTicket { get; set; }

    protected ConfiguracionGeneral() { }

    public ConfiguracionGeneral(
        decimal comisionVenta,
        decimal comisionVerde,
        int minutosAnulacion,
        bool vendedorAnula,
        string nombreEmpresa,
        string? telefono = null,
        string? pie = null)
    {
        ComisionVentaPorDefecto = comisionVenta;
        ComisionVerdePorDefecto = comisionVerde;
        MinutosVentanaAnulacion = minutosAnulacion;
        VendedorPuedeAnular = vendedorAnula;
        NombreEmpresa = nombreEmpresa;
        TelefonoEmpresa = telefono;
        PieTicket = pie;
    }

    public void Update(
        decimal comisionVenta,
        decimal comisionVerde,
        int minutosAnulacion,
        bool vendedorAnula,
        string nombreEmpresa,
        string? telefono,
        string? pie)
    {
        ComisionVentaPorDefecto = comisionVenta;
        ComisionVerdePorDefecto = comisionVerde;
        MinutosVentanaAnulacion = minutosAnulacion;
        VendedorPuedeAnular = vendedorAnula;
        NombreEmpresa = nombreEmpresa;
        TelefonoEmpresa = telefono;
        PieTicket = pie;
    }
}
