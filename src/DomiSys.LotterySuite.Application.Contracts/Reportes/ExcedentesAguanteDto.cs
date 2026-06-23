using System;
using System.Collections.Generic;

namespace DomiSys.LotterySuite.Reportes;

public class ExcedentesAguanteParametrosDto
{
    public Guid? LoteriaId { get; set; }
    public Guid? SorteoId { get; set; }
    public DateTime Fecha { get; set; }
}

public class ExcedentesAguanteItemDto
{
    public string NombreLoteria { get; set; } = string.Empty;
    public string NombreSorteo { get; set; } = string.Empty;
    public int Numero { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
    public decimal MontoVendido { get; set; }
    public decimal ExcedenteAguante { get; set; }
    public decimal Disponible { get; set; }
    public decimal PorcentajeUso { get; set; }
}

public class ExcedentesAguanteReporteDto
{
    public DateTime Fecha { get; set; }
    public string FiltroLoteria { get; set; } = string.Empty;
    public string FiltroSorteo { get; set; } = string.Empty;
    public List<ExcedentesAguanteItemDto> Items { get; set; } = new();
    public decimal TotalExcedente { get; set; }
    public int CantidadNumeros { get; set; }
}
