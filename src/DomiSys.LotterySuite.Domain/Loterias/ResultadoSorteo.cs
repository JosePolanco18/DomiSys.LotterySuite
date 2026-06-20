using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Loterias;

public class ResultadoSorteo : AuditedEntity<Guid>
{
    public Guid SorteoId { get; set; }
    public DateTime Fecha { get; set; }
    public int Primera { get; set; }
    public int Segunda { get; set; }
    public int Tercera { get; set; }
    public FuenteResultado Fuente { get; set; }
    public bool Verificado { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string? RegistradoPor { get; set; }

    public virtual Sorteo Sorteo { get; set; } = null!;

    protected ResultadoSorteo() { }

    public ResultadoSorteo(
        Guid id,
        Guid sorteoId,
        DateTime fecha,
        int primera,
        int segunda,
        int tercera,
        FuenteResultado fuente) : base(id)
    {
        SorteoId = sorteoId;
        Fecha = fecha;
        Primera = primera;
        Segunda = segunda;
        Tercera = tercera;
        Fuente = fuente;
        FechaRegistro = DateTime.UtcNow;
        Verificado = fuente == FuenteResultado.Scraping;
    }

    public bool ContieneNumero(int numero)
    {
        return numero == Primera || numero == Segunda || numero == Tercera;
    }
}
