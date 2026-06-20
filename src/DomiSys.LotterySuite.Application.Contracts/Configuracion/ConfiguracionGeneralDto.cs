namespace DomiSys.LotterySuite.Configuracion;

public class ConfiguracionGeneralDto
{
    public decimal ComisionVentaPorDefecto { get; set; }
    public decimal ComisionVerdePorDefecto { get; set; }
    public int MinutosVentanaAnulacion { get; set; }
    public bool VendedorPuedeAnular { get; set; }
}
