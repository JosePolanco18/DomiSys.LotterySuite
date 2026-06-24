namespace DomiSys.LotterySuite.GestionEfectivo;

public class PreviewLiquidacionDto
{
    public decimal SaldoEfectivo { get; set; }
    public decimal VentasBrutas { get; set; }
    public decimal TotalPremiosPagados { get; set; }
    public decimal PorcentajeComisionVenta { get; set; }
    public decimal MontoComisionVenta { get; set; }
    public decimal PorcentajeComisionVerde { get; set; }
    public decimal MontoComisionVerde { get; set; }
    public decimal TotalComisiones { get; set; }
    public decimal MontoSugeridoEntrega { get; set; }
}
