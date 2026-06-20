using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace DomiSys.LotterySuite.Loterias;

public class Sorteo : AuditedEntity<Guid>
{
    public Guid LoteriaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string DiasActivos { get; set; } = string.Empty; // "L,M,Mi,J,V,S,D"
    public TimeSpan HoraAperturaVentas { get; set; }
    public TimeSpan HoraCierreVentas { get; set; }
    public TimeSpan HoraSorteo { get; set; }
    public int MinutosEsperaScraping { get; set; } = 15;
    public bool Activo { get; set; } = true;

    public virtual Loteria Loteria { get; set; } = null!;
    public virtual ICollection<ResultadoSorteo> Resultados { get; set; } = new List<ResultadoSorteo>();

    protected Sorteo() { }

    public Sorteo(
        Guid id,
        Guid loteriaId,
        string nombre,
        string diasActivos,
        TimeSpan horaAperturaVentas,
        TimeSpan horaCierreVentas,
        TimeSpan horaSorteo,
        int minutosEsperaScraping = 15) : base(id)
    {
        LoteriaId = loteriaId;
        Nombre = nombre;
        DiasActivos = diasActivos;
        HoraAperturaVentas = horaAperturaVentas;
        HoraCierreVentas = horaCierreVentas;
        HoraSorteo = horaSorteo;
        MinutosEsperaScraping = minutosEsperaScraping;
    }

    public bool EstaAbiertoParaVentas(DateTime fechaHoraServidor)
    {
        var hora = fechaHoraServidor.TimeOfDay;
        var diaSemana = fechaHoraServidor.DayOfWeek;

        if (!DiasActivos.Contains(ObtenerAbreviaturaDia(diaSemana)))
            return false;

        // ponytail: handle midnight crossing (e.g. open 23:00, close 02:00)
        if (HoraCierreVentas > HoraAperturaVentas)
            return hora >= HoraAperturaVentas && hora < HoraCierreVentas;
        else
            return hora >= HoraAperturaVentas || hora < HoraCierreVentas;
    }

    public bool DebeIniciarScraping(DateTime fechaHoraServidor)
    {
        var hora = fechaHoraServidor.TimeOfDay;
        var horaInicioScraping = HoraSorteo.Add(TimeSpan.FromMinutes(MinutosEsperaScraping));
        return hora >= horaInicioScraping;
    }

    private static string ObtenerAbreviaturaDia(DayOfWeek dia) => dia switch
    {
        DayOfWeek.Monday => "L",
        DayOfWeek.Tuesday => "M",
        DayOfWeek.Wednesday => "Mi",
        DayOfWeek.Thursday => "J",
        DayOfWeek.Friday => "V",
        DayOfWeek.Saturday => "S",
        DayOfWeek.Sunday => "D",
        _ => string.Empty
    };
}
