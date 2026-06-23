using System;
using Volo.Abp.Domain.Entities;

namespace DomiSys.LotterySuite.Configuracion;

public class ConfiguracionGeneral : Entity<Guid>
{
    public static readonly Guid SingletonId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public decimal ComisionVentaPorDefecto { get; set; } = 7m;
    public decimal ComisionVerdePorDefecto { get; set; } = 5m;
    public int MinutosVentanaAnulacion { get; set; } = 5;
    public bool VendedorPuedeAnular { get; set; } = true;

    // Datos para tickets impresos
    public string NombreEmpresa { get; set; } = "DomiSys Lottery";
    public string? TelefonoEmpresa { get; set; }
    public string? PieTicket { get; set; } = "Conserve este ticket";

    protected ConfiguracionGeneral() { }

    public ConfiguracionGeneral(Guid id) : base(id) { }
}
