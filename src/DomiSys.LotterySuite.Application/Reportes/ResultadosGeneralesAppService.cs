using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Reportes;

[Authorize]
public class ResultadosGeneralesAppService : ApplicationService
{
    public async Task<List<ResultadoScrapedDto>> ObtenerTodosResultadosAsync()
    {
        // ponytail: try conectate first (more up-to-date), fallback to loteriadominicanas
        var resultados = await ScrapeConectateAsync();
        if (resultados.Count == 0)
        {
            Logger.LogWarning("Conectate falló, usando loteriadominicanas como fallback");
            resultados = await ScrapeLoteriadominicanaAsync();
        }
        return resultados;
    }

    private static async Task<List<ResultadoScrapedDto>> ScrapeConectateAsync()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var html = await http.GetStringAsync("https://www.conectate.com.do/loterias/");

            var clean = Regex.Replace(html, @"<[^>]+>", "\n");
            var lines = clean.Split('\n')
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrEmpty(l))
                .ToList();

            var results = new List<ResultadoScrapedDto>();
            // ponytail: names that signal a quiniela result (3 numbers)
            var loteriaNames = new[]
            {
                "Juega + Pega +", "Gana Más", "Lotería Nacional", "Pega 3 Más",
                "Quiniela Leidsa", "Quiniela Real", "Quiniela Loteka",
                "La Primera Día", "Primera Noche", "LoteDom",
                "King Lottery 12:30", "King Lottery 7:30",
                "Anguila 10:00 AM", "Anguila 1:00 PM", "Anguila 6:00 PM", "Anguila 9:00 PM",
                "La Suerte"
            };

            // ponytail: conectate shows latest results, date badges are unreliable — track last seen date
            var lastSeenDate = "";
            for (int i = 0; i < lines.Count; i++)
            {
                // Capture date badges (format: dd-mm) that appear before lottery names
                var dateMatch = Regex.Match(lines[i], @"^(\d{2}-\d{2})$");
                if (dateMatch.Success) { lastSeenDate = dateMatch.Groups[1].Value; continue; }

                var matchedName = loteriaNames.FirstOrDefault(n =>
                    lines[i].Equals(n, StringComparison.OrdinalIgnoreCase));

                if (matchedName == null) continue;

                var nums = new List<int>();
                for (int j = i + 1; j < Math.Min(i + 6, lines.Count); j++)
                {
                    if (Regex.IsMatch(lines[j], @"^\d{2}$") && int.Parse(lines[j]) <= 99)
                        nums.Add(int.Parse(lines[j]));
                    // Stop if we hit another date or lottery name
                    if (Regex.IsMatch(lines[j], @"^\d{2}-\d{2}$") || loteriaNames.Any(n => lines[j].Equals(n, StringComparison.OrdinalIgnoreCase)))
                        break;
                }

                if (nums.Count >= 3)
                {
                    results.Add(new ResultadoScrapedDto
                    {
                        Loteria = matchedName,
                        Primera = nums[0],
                        Segunda = nums[1],
                        Tercera = nums[2],
                        Fecha = lastSeenDate
                    });
                }
            }
            return results;
        }
        catch
        {
            return new List<ResultadoScrapedDto>();
        }
    }

    private static async Task<List<ResultadoScrapedDto>> ScrapeLoteriadominicanaAsync()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var html = await http.GetStringAsync("https://www.loteriadominicanas.com");

            var results = new List<ResultadoScrapedDto>();
            var sections = Regex.Split(html, @"<h3");

            foreach (var section in sections.Skip(1))
            {
                var titleMatch = Regex.Match(section, @">([^<]+)</a>");
                var fechaMatch = Regex.Match(section, @"(\d{2}-\d{2}-\d{4})");
                var nums = Regex.Matches(section[..Math.Min(800, section.Length)], @"(?<![0-9\-/])(\d{2})(?![0-9\-/])");

                if (!titleMatch.Success || !fechaMatch.Success) continue;

                var cleanNums = nums.Cast<Match>()
                    .Select(m => int.Parse(m.Groups[1].Value))
                    .Where(n => n <= 99)
                    .Take(3)
                    .ToList();

                if (cleanNums.Count < 3) continue;

                results.Add(new ResultadoScrapedDto
                {
                    Loteria = titleMatch.Groups[1].Value.Trim(),
                    Primera = cleanNums[0],
                    Segunda = cleanNums[1],
                    Tercera = cleanNums[2],
                    Fecha = fechaMatch.Groups[1].Value
                });
            }
            return results;
        }
        catch
        {
            return new List<ResultadoScrapedDto>();
        }
    }
}
