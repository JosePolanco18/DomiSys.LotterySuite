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
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
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
        var currentTenant = workerContext.ServiceProvider.GetRequiredService<ICurrentTenant>();
        var dataFilter = workerContext.ServiceProvider.GetRequiredService<IDataFilter>();
        var logger = workerContext.ServiceProvider.GetRequiredService<ILogger<ResultadoScrapingWorker>>();

        // Get all distinct TenantIds from sorteos (cross-tenant)
        var sorteoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<Sorteo, Guid>>();
        List<Guid?> tenantIds;
        using (dataFilter.Disable<IMultiTenant>())
        {
            var allSorteos = await sorteoRepo.GetQueryableAsync();
            tenantIds = (await sorteoRepo.AsyncExecuter.ToListAsync(
                allSorteos.Select(s => s.TenantId).Distinct())).ToList();
        }

        foreach (var tenantId in tenantIds)
        {
            using (currentTenant.Change(tenantId))
            {
                try { await DoWorkForTenantAsync(workerContext, logger); }
                catch (Exception ex) { logger.LogError(ex, "Error scraping para tenant {TenantId}", tenantId); }
            }
        }
    }

    private async Task DoWorkForTenantAsync(PeriodicBackgroundWorkerContext workerContext, ILogger<ResultadoScrapingWorker> logger)
    {
        var sorteoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<Sorteo, Guid>>();
        var resultadoRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<ResultadoSorteo, Guid>>();
        var detalleTicketRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<DetalleTicket, Guid>>();
        var ticketRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<Ticket, Guid>>();

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
            if (!scraped.TryGetValue(key, out var nums))
            {
                var altKey = NormalizeKey(sorteo.Nombre);
                if (!scraped.TryGetValue(altKey, out nums)) continue;
            }

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
            var terminalRepo = workerContext.ServiceProvider.GetRequiredService<IRepository<DomiSys.LotterySuite.Terminales.Terminal, Guid>>();
            var gestionManager = workerContext.ServiceProvider.GetRequiredService<DomiSys.LotterySuite.GestionEfectivo.GestionEfectivoManager>();
            await CalcularGanadoresAsync(resultado, detalleTicketRepo, ticketRepo, resultadoRepo, configPagoSorteoRepo, terminalRepo, gestionManager);
        }
    }

    // ponytail: each game_id maps to multiple possible normalized keys to match against DB sorteo names
    public static readonly Dictionary<string, string[]> GameIdMap = new()
    {
        ["6966a6d1ea7015c3b8a3d453"] = new[] { "quinielaleidsa", "leidsaquinielaleidsa", "leidsaquiniela" },
        ["6966a6d1ea7015c3b8a3d47c"] = new[] { "loteríanacional", "loteríanacionalquiniela", "nacionalquiniela" },
        ["6966a6d1ea7015c3b8a3d482"] = new[] { "ganamás", "loteríanacionalganamás", "nacionalganamás" },
        ["6966a6d2ea7015c3b8a3d4ae"] = new[] { "quinielareal", "loteríarealquinielareal", "loteríarealquiniela", "realquiniela" },
        ["6966a6d2ea7015c3b8a3d4d7"] = new[] { "quinielaloteka", "lotekaquinielaloteka", "lotekaquiniela" },
        ["6966a6d2ea7015c3b8a3d48e"] = new[] { "juegapega", "juega+pega+", "leidsajuegapega", "leidsajuega+pega+" },
        ["6966a6d1ea7015c3b8a3d471"] = new[] { "pega3más", "leidsapega3más", "nacionalpega3más" },
        ["6966a6d2ea7015c3b8a3d5c0"] = new[] { "laprimeraquinielamediodía", "laprimeradia", "primeradía", "laprimeraquinielondia", "quinielondia", "quinielonmediodía" },
        ["6966a6d2ea7015c3b8a3d5c6"] = new[] { "laprimeraquinielanoche", "laprimeraquinielonnoche", "primeranoche", "quinielonnoche" },
        ["6966a6d3ea7015c3b8a3d5e3"] = new[] { "lotedomquiniela", "lotedom" },
        ["6966a6d2ea7015c3b8a3d509"] = new[] { "newyork330", "newyorkmediodía", "newyork" },
        ["6966a6d2ea7015c3b8a3d50f"] = new[] { "newyork1130", "newyorknoche" },
        ["6966a6d2ea7015c3b8a3d515"] = new[] { "kinglotteryquinieladia", "kinglottery1230", "kinglotterydia" },
        ["6966a6d2ea7015c3b8a3d51b"] = new[] { "kinglotteryquinielanoche", "kinglottery730", "kinglotterynoche" },
        ["6966a6d3ea7015c3b8a3d5e9"] = new[] { "lasuertedominicana", "lasuerte", "lasuertedominicanaquiniela" },
        ["6966a6d2ea7015c3b8a3d527"] = new[] { "anguila10am", "anguila1000am", "anguilla10am" },
        ["6966a6d2ea7015c3b8a3d5cc"] = new[] { "anguila1pm", "anguila100pm", "anguilla1pm", "anguila12pm", "anguilla12pm" },
        ["6966a6d2ea7015c3b8a3d5d2"] = new[] { "anguila6pm", "anguila600pm", "anguilla5pm", "anguila5pm" },
        ["6966a6d2ea7015c3b8a3d5d8"] = new[] { "anguila9pm", "anguila900pm", "anguilla9pm" },
    };

    public static async Task<Dictionary<string, (int, int, int)>> ScrapeResultadosAsync()
    {
        return await ScrapeConectateApiAsync();
    }

    public static async Task<Dictionary<string, (int, int, int)>> ScrapeConectateApiAsync()
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
        var json = await http.GetStringAsync("https://api.temp.conectate.com.do/conectate/sessions?limit=1");
        var entries = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);

        var results = new Dictionary<string, (int, int, int)>(StringComparer.OrdinalIgnoreCase);

        foreach (var entry in entries.EnumerateArray())
        {
            var gameId = entry.GetProperty("game_id").GetString() ?? "";
            if (!GameIdMap.TryGetValue(gameId, out var keys)) continue;

            var sessions = entry.GetProperty("sessions");
            if (sessions.GetArrayLength() == 0) continue;

            var session = sessions[0];
            var score = session.GetProperty("score");
            if (score.GetArrayLength() == 0) continue;

            var nums = score[0];
            if (nums.GetArrayLength() < 3) continue;

            var n1 = int.TryParse(nums[0].GetString(), out var v1) ? v1 : -1;
            var n2 = int.TryParse(nums[1].GetString(), out var v2) ? v2 : -1;
            var n3 = int.TryParse(nums[2].GetString(), out var v3) ? v3 : -1;

            if (n1 >= 0 && n1 <= 99 && n2 >= 0 && n2 <= 99 && n3 >= 0 && n3 <= 99)
                foreach (var k in keys)
                    results[k] = (n1, n2, n3);
        }
        return results;
    }

    // ponytail: brute-force key matching, add mapping table if names diverge too much
    public static string BuildScrapingKey(string loteriaName, string sorteoName)
    {
        return NormalizeKey($"{loteriaName} {sorteoName}");
    }

    public static string NormalizeKey(string s)
    {
        return Regex.Replace(s.ToLowerInvariant(), @"[^a-záéíóúñ0-9]", "");
    }

    private static async Task CalcularGanadoresAsync(
        ResultadoSorteo resultado,
        IRepository<DetalleTicket, Guid> detalleRepo,
        IRepository<Ticket, Guid> ticketRepo,
        IRepository<ResultadoSorteo, Guid> resultadoRepo,
        IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepo,
        IRepository<DomiSys.LotterySuite.Terminales.Terminal, Guid> terminalRepo,
        DomiSys.LotterySuite.GestionEfectivo.GestionEfectivoManager gestionManager)
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

                var terminal = await terminalRepo.GetAsync(ticket.TerminalId);
                await gestionManager.RegistrarMovimientoAsync(
                    terminal, DomiSys.LotterySuite.GestionEfectivo.TipoMovimientoEfectivo.PagoPremio,
                    -ticket.TotalPremios, ticket.Id, "SISTEMA", "Premio pendiente de pago");
                await terminalRepo.UpdateAsync(terminal, autoSave: true);
            }
        }
    }
}
