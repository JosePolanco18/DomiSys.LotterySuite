using System;

namespace DomiSys.LotterySuite.ControlRiesgo;

public class AplicarLimitesMasivosDto
{
    public Guid? LoteriaId { get; set; }
    public Guid? SorteoId { get; set; }
    public decimal LimiteVentaMaximo { get; set; }
    public decimal LimiteAguante { get; set; }
}

public class ResultadoLimitesMasivosDto
{
    public int Creados { get; set; }
    public int Actualizados { get; set; }
    public int Total { get; set; }
}
