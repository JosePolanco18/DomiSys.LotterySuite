namespace DomiSys.LotterySuite.Configuracion;

public class ConfiguracionGeneralDto
{
    public decimal ComisionVentaPorDefecto { get; set; }
    public decimal ComisionVerdePorDefecto { get; set; }
    public int MinutosVentanaAnulacion { get; set; }
    public bool VendedorPuedeAnular { get; set; }
    public string NombreEmpresa { get; set; } = string.Empty;
    public string? TelefonoEmpresa { get; set; }
    public string? PieTicket { get; set; }

    public decimal? LimiteQuiniela { get; set; }
    public decimal? LimitePale { get; set; }
    public decimal? LimiteTripleta { get; set; }
    public decimal? LimiteSuperPale { get; set; }
}
