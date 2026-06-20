using System.Collections.Generic;

namespace DomiSys.LotterySuite.Reportes;

public class ResultadoScrapedDto
{
    public string Loteria { get; set; } = string.Empty;
    public int Primera { get; set; }
    public int Segunda { get; set; }
    public int Tercera { get; set; }
    public string Fecha { get; set; } = string.Empty;
}
