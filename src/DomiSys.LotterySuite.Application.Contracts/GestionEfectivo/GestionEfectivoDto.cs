using System;
using DomiSys.LotterySuite.GestionEfectivo;

namespace DomiSys.LotterySuite.GestionEfectivo;

public class MovimientoEfectivoDto
{
    public Guid Id { get; set; }
    public Guid TerminalId { get; set; }
    public string NombreTerminal { get; set; } = string.Empty;
    public TipoMovimientoEfectivo Tipo { get; set; }
    public string TipoLabel => Tipo switch
    {
        TipoMovimientoEfectivo.Venta => "Venta",
        TipoMovimientoEfectivo.PagoPremio => "Pago Premio",
        TipoMovimientoEfectivo.EntregaFondosAdmin => "Fondos de Admin",
        TipoMovimientoEfectivo.EntregaFondosTerminal => "Entrega a Admin",
        TipoMovimientoEfectivo.AjusteComision => "Comisiones",
        TipoMovimientoEfectivo.AnulacionVenta => "Anulación",
        _ => Tipo.ToString()
    };
    public decimal Monto { get; set; }
    public decimal SaldoAnterior { get; set; }
    public decimal SaldoNuevo { get; set; }
    public Guid? ReferenciaId { get; set; }
    public string? Notas { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
    public DateTime FechaMovimiento { get; set; }
}

public class RegistrarTransferenciaDto
{
    public Guid TerminalId { get; set; }
    public decimal Monto { get; set; }
    public string? Notas { get; set; }
}

public class ResumenEfectivoTerminalDto
{
    public Guid TerminalId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public decimal SaldoEfectivo { get; set; }
    public bool EstaEnVerde => SaldoEfectivo >= 0;
}
