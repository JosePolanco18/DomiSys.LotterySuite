using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Ventas;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Volo.Abp.BackgroundWorkers;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Threading;
using Volo.Abp.Uow;

namespace DomiSys.LotterySuite.Loterias;

public class ResultadoScrapingWorker : AsyncPeriodicBackgroundWorkerBase
{
    private static readonly TimeZoneInfo ZonaRd = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");

    public ResultadoScrapingWorker(AbpAsyncTimer timer, IServiceScopeFactory serviceScopeFactory)
        : base(timer, serviceScopeFactory)
    {
        // ponytail: check every 2 minutes, scraping logic filters by time
        Timer.Period = 120_000;
    }

    [UnitOfWork]
    protected override async Task DoWorkAsync(PeriodicBackgroundWorkerContext workerContext)
    {
        var sorteoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<Sorteo, Guid>>();
        var resultadoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<ResultadoSorteo, Guid>>();
        var detalleTicketRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<DetalleTicket, Guid>>();
        var ticketRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<Ticket, Guid>>();
        var logger = workerContext.ServiceProvider.GetRequiredService<ILogger<ResultadoScrapingWorker>>();

        var ahoraRD = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaRd);
        var hoyRD = ahoraRD.Date;

        var queryable = await sorteoRepo.WithDetailsAsync(s => s.Loteria);
        var sorteos = await sorteoRepo.AsyncExecuter.ToListAsync(
            queryable.Where(s => s.Activo && s.Loteria.Activa));

        var sorteosParaScraping = sorteos.Where(s => s.DebeIniciarScraping(ahoraRD)).ToList();
        if (!sorteosParaScraping.Any()) return;

        var resultadoQueryable = await resultadoRepo.GetQueryableAsync();
        var resultadosHoy = await resultadoRepo.AsyncExecuter.ToListAsync(
            resultadoQueryable.Where(r => r.Fecha.Date == hoyRD));

        var sorteosSinResultado = sorteosParaScraping
            .Where(s => !resultadosHoy.Any(r => r.SorteoId == s.Id))
            .ToList();

        if (!sorteosSinResultado.Any()) return;

        logger.LogInformation("Scraping: {Count} sorteos pendientes de resultado", sorteosSinResultado.Count);

        Dictionary<string, (int primera, int segunda, int tercera)>? scraped = null;
        try
        {
            scraped = await ScrapeResultadosAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Error scraping loteriadominicanas.com");
            return;
        }

        if (scraped == null || !scraped.Any()) return;

        foreach (var sorteo in sorteosSinResultado)
        {
            var key = BuildScrapingKey(sorteo.Loteria.Nombre, sorteo.Nombre);
            if (!scraped.TryGetValue(key, out var nums)) continue;

            var resultado = new ResultadoSorteo(
                Guid.NewGuid(), sorteo.Id, hoyRD,
                nums.primera, nums.segunda, nums.tercera,
                FuenteResultado.Scraping
            );
            resultado.RegistradoPor = "Scraping";

            await resultadoRepo.InsertAsync(resultado, autoSave: true);
            logger.LogInformation("Resultado registrado: {Loteria} {Sorteo} → {P}-{S}-{T}",
                sorteo.Loteria.Nombre, sorteo.Nombre, nums.primera, nums.segunda, nums.tercera);

            var configPagoSorteoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<ConfiguracionPagoSorteo, Guid>>();
            await CalcularGanadoresAsync(resultado, detalleTicketRepo, ticketRepo, resultadoRepo, configPagoSorteoRepo);
        }
    }

    private static async Task<Dictionary<string, (int, int, int)>> ScrapeResultadosAsync()
    {
        // ponytail: conectate first (fresher data), fallback to loteriadominicanas
        var results = await ScrapeConectateAsync();
        if (results.Count == 0)
            results = await ScrapeLoteriadominicanaAsync();
        return results;
    }

    private static async Task<Dictionary<string, (int, int, int)>> ScrapeConectateAsync()
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
        var html = await http.GetStringAsync("https://www.conectate.com.do/loterias/");

        var clean = Regex.Replace(html, @"<[^>]+>", "\n");
        var lines = clean.Split('\n').Select(l => l.Trim()).Where(l => l.Length > 0).ToList();

        var loteriaNames = new[]
        {
            "Juega + Pega +", "Gana Más", "Lotería Nacional", "Pega 3 Más",
            "Quiniela Leidsa", "Quiniela Real", "Quiniela Loteka",
            "La Primera Día", "Primera Noche", "LoteDom",
            "King Lottery 12:30", "King Lottery 7:30",
            "Anguila 10:00 AM", "Anguila 1:00 PM", "Anguila 6:00 PM", "Anguila 9:00 PM",
            "La Suerte"
        };

        var results = new Dictionary<string, (int, int, int)>(StringComparer.OrdinalIgnoreCase);
        for (int i = 0; i < lines.Count; i++)
        {
            var matched = loteriaNames.FirstOrDefault(n => lines[i].Equals(n, StringComparison.OrdinalIgnoreCase));
            if (matched == null) continue;

            var nums = new List<int>();
            for (int j = i + 1; j < Math.Min(i + 8, lines.Count); j++)
            {
                if (Regex.IsMatch(lines[j], @"^\d{2}$") && int.Parse(lines[j]) <= 99)
                    nums.Add(int.Parse(lines[j]));
            }
            if (nums.Count >= 3)
                results[NormalizeKey(matched)] = (nums[0], nums[1], nums[2]);
        }
        return results;
    }

    private static async Task<Dictionary<string, (int, int, int)>> ScrapeLoteriadominicanaAsync()
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
        var html = await http.GetStringAsync("https://www.loteriadominicanas.com");

        var results = new Dictionary<string, (int, int, int)>(StringComparer.OrdinalIgnoreCase);
        var sections = Regex.Split(html, @"<h3");

        foreach (var section in sections.Skip(1))
        {
            var titleMatch = Regex.Match(section, @">([^<]+)</a>");
            if (!titleMatch.Success) continue;
            var nums = Regex.Matches(section[..Math.Min(800, section.Length)], @"(?<![0-9\-/])(\d{2})(?![0-9\-/])")
                .Cast<Match>().Select(m => int.Parse(m.Groups[1].Value)).Where(n => n <= 99).Take(3).ToList();
            if (nums.Count < 3) continue;
            results[NormalizeKey(titleMatch.Groups[1].Value.Trim())] = (nums[0], nums[1], nums[2]);
        }
        return results;
    }

    // ponytail: brute-force key matching, add mapping table if names diverge too much
    private static string BuildScrapingKey(string loteriaName, string sorteoName)
    {
        return NormalizeKey($"{loteriaName} {sorteoName}");
    }

    private static string NormalizeKey(string s)
    {
        return Regex.Replace(s.ToLowerInvariant(), @"[^a-záéíóúñ0-9]", "");
    }

    private static async Task CalcularGanadoresAsync(
        ResultadoSorteo resultado,
        IRepository<DetalleTicket, Guid> detalleRepo,
        IRepository<Ticket, Guid> ticketRepo,
        IRepository<ResultadoSorteo, Guid> resultadoRepo,
        IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepo)
    {
        // Load position-based payout config for this sorteo
        var configQ = await configPagoSorteoRepo.GetQueryableAsync();
        var config = await configPagoSorteoRepo.AsyncExecuter.FirstOrDefaultAsync(
            configQ.Where(c => c.SorteoId == resultado.SorteoId));

        var queryable = await detalleRepo.GetQueryableAsync();
        var detalles = await detalleRepo.AsyncExecuter.ToListAsync(
            queryable.Where(d =>
                d.SorteoId == resultado.SorteoId &&
                d.FechaSorteo.Date == resultado.Fecha.Date &&
                !d.EsGanador));

        var ticketIds = new HashSet<Guid>();

        foreach (var d in detalles)
        {
            decimal pago = 0;
            decimal multiplicador = 0;

            switch (d.TipoJugada)
            {
                case TipoJugada.Quiniela:
                    if (d.PrimerNumero == resultado.Primera)
                    {
                        multiplicador = config?.QuinielaPrimera ?? 60;
                        pago = d.Monto * multiplicador;
                    }
                    else if (d.PrimerNumero == resultado.Segunda)
                    {
                        multiplicador = config?.QuinielaSegunda ?? 40;
                        pago = d.Monto * multiplicador;
                    }
                    else if (d.PrimerNumero == resultado.Tercera)
                    {
                        multiplicador = config?.QuinielaTercera ?? 20;
                        pago = d.Monto * multiplicador;
                    }
                    break;

                case TipoJugada.Pale:
                    if (d.SegundoNumero.HasValue && d.PrimerNumero != d.SegundoNumero)
                    {
                        var nums = new[] { d.PrimerNumero, d.SegundoNumero.Value };
                        var positions = new HashSet<int>();
                        foreach (var n in nums)
                        {
                            if (n == resultado.Primera) positions.Add(1);
                            else if (n == resultado.Segunda) positions.Add(2);
                            else if (n == resultado.Tercera) positions.Add(3);
                        }
                        if (positions.Count == 2)
                        {
                            if (positions.Contains(1) && positions.Contains(2))
                                multiplicador = config?.PalePrimeraSegunda ?? 1000;
                            else if (positions.Contains(1) && positions.Contains(3))
                                multiplicador = config?.PalePrimeraTercera ?? 800;
                            else
                                multiplicador = config?.PaleSegundaTercera ?? 500;
                            pago = d.Monto * multiplicador;
                        }
                    }
                    break;

                case TipoJugada.Tripleta:
                    if (d.SegundoNumero.HasValue && d.TercerNumero.HasValue &&
                        new HashSet<int> { d.PrimerNumero, d.SegundoNumero.Value, d.TercerNumero.Value }
                            .SetEquals(new HashSet<int> { resultado.Primera, resultado.Segunda, resultado.Tercera }))
                    {
                        multiplicador = config?.Tripleta ?? 100000;
                        pago = d.Monto * multiplicador;
                    }
                    break;

                case TipoJugada.SuperPale:
                    if (d.SegundoNumero.HasValue && d.SegundoSorteoId.HasValue)
                    {
                        var rq = await resultadoRepo.GetQueryableAsync();
                        var resultado2 = await resultadoRepo.AsyncExecuter.FirstOrDefaultAsync(
                            rq.Where(r => r.SorteoId == d.SegundoSorteoId.Value && r.Fecha.Date == resultado.Fecha.Date));
                        if (resultado2 != null)
                        {
                            var n1 = d.PrimerNumero;
                            var n2 = d.SegundoNumero.Value;
                            if ((n1 == resultado.Primera && n2 == resultado2.Primera) ||
                                (n2 == resultado.Primera && n1 == resultado2.Primera))
                            {
                                multiplicador = config?.SuperPale ?? 1000;
                                pago = d.Monto * multiplicador;
                            }
                        }
                    }
                    break;
            }

            if (pago > 0)
            {
                d.MarcarComoGanador(pago, multiplicador);
                await detalleRepo.UpdateAsync(d, autoSave: true);
                ticketIds.Add(d.TicketId);
            }
        }

        foreach (var ticketId in ticketIds)
        {
            var tq = await ticketRepo.WithDetailsAsync(t => t.Detalles);
            var ticket = await ticketRepo.AsyncExecuter.FirstOrDefaultAsync(tq.Where(t => t.Id == ticketId));
            if (ticket != null)
            {
                ticket.CalcularPremios();
                await ticketRepo.UpdateAsync(ticket, autoSave: true);
            }
        }
    }
}
