using System;
using System.Collections.Generic;

namespace DomiSys.LotterySuite.Reportes;

public class DashboardDto
{
    public decimal VentasHoy { get; set; }
    public decimal PremiosPagadosHoy { get; set; }
    public int TicketsHoy { get; set; }
    public int TerminalesActivas { get; set; }
    public List<VentaPorTerminalDto> VentasPorTerminal { get; set; } = new();
    public List<ResultadoRecienteDto> UltimosResultados { get; set; } = new();
    public List<NumeroMasVendidoDto> NumerosMasVendidos { get; set; } = new();
}

public class VentaPorTerminalDto
{
    public string NombreTerminal { get; set; } = string.Empty;
    public string NombreVendedor { get; set; } = string.Empty;
    public decimal MontoVendido { get; set; }
    public int CantidadTickets { get; set; }
}

public class ResultadoRecienteDto
{
    public string NombreLoteria { get; set; } = string.Empty;
    public string NombreSorteo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int Primera { get; set; }
    public int Segunda { get; set; }
    public int Tercera { get; set; }
}

public class NumeroMasVendidoDto
{
    public int Numero { get; set; }
    public decimal MontoTotal { get; set; }
    public int CantidadJugadas { get; set; }
}
