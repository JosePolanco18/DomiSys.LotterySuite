using System;
using DomiSys.LotterySuite.Terminales;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Cuadres;

public class CuadreTerminal : AuditedEntity<Guid>
{
    public Guid TerminalId { get; set; }
    public DateTime FechaCuadre { get; set; }
    public DateTime PeriodoInicio { get; set; }
    public DateTime PeriodoFin { get; set; }
    public decimal VentasBrutas { get; set; }
    public decimal TotalPremiosPagados { get; set; }
    public decimal PorcentajeComisionVenta { get; set; }
    public decimal MontoComisionVenta { get; set; }
    public decimal PorcentajeComisionVerde { get; set; }
    public decimal MontoComisionVerde { get; set; }
    public decimal BalanceNeto { get; set; }
    public bool QuedoEnVerde { get; set; }
    public string? Notas { get; set; }
    public string CuadradoPor { get; set; } = string.Empty;

    public virtual Terminal Terminal { get; set; } = null!;

    protected CuadreTerminal() { }

    public CuadreTerminal(
        Guid id,
        Guid terminalId,
        DateTime periodoInicio,
        DateTime periodoFin,
        decimal ventasBrutas,
        decimal totalPremiosPagados,
        decimal porcentajeComisionVenta,
        decimal porcentajeComisionVerde,
        string cuadradoPor) : base(id)
    {
        TerminalId = terminalId;
        FechaCuadre = DateTime.UtcNow;
        PeriodoInicio = periodoInicio;
        PeriodoFin = periodoFin;
        VentasBrutas = ventasBrutas;
        TotalPremiosPagados = totalPremiosPagados;
        PorcentajeComisionVenta = porcentajeComisionVenta;
        PorcentajeComisionVerde = porcentajeComisionVerde;
        CuadradoPor = cuadradoPor;

        Calcular();
    }

    public void Calcular()
    {
        MontoComisionVenta = VentasBrutas * (PorcentajeComisionVenta / 100);
        QuedoEnVerde = VentasBrutas > TotalPremiosPagados;
        MontoComisionVerde = QuedoEnVerde
            ? (VentasBrutas - TotalPremiosPagados) * (PorcentajeComisionVerde / 100)
            : 0;
        BalanceNeto = VentasBrutas - TotalPremiosPagados - MontoComisionVenta - MontoComisionVerde;
    }
}
