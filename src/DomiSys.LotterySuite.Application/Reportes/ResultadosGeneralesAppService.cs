using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;

namespace DomiSys.LotterySuite.Reportes;

[Authorize]
public class ResultadosGeneralesAppService : ApplicationService
{
    private static readonly Dictionary<string, string> GameNames = new()
    {
        ["6966a6d1ea7015c3b8a3d453"] = "Quiniela LEIDSA",
        ["6966a6d1ea7015c3b8a3d47c"] = "Lotería Nacional Quiniela",
        ["6966a6d1ea7015c3b8a3d482"] = "Gana Más",
        ["6966a6d2ea7015c3b8a3d4ae"] = "Quiniela Real",
        ["6966a6d2ea7015c3b8a3d4d7"] = "Quiniela Loteka",
        ["6966a6d2ea7015c3b8a3d48e"] = "Juega + Pega +",
        ["6966a6d1ea7015c3b8a3d471"] = "Pega 3 Más",
        ["6966a6d1ea7015c3b8a3d44d"] = "Loto Más",
        ["6966a6d1ea7015c3b8a3d459"] = "Super Kino TV",
        ["6966a6d1ea7015c3b8a3d45f"] = "Loto Pool",
        ["6966a6d2ea7015c3b8a3d4a8"] = "Loto Real",
        ["6966a6d2ea7015c3b8a3d4dd"] = "Mega Chances",
        ["6966a6d2ea7015c3b8a3d509"] = "New York Tarde",
        ["6966a6d2ea7015c3b8a3d50f"] = "New York Noche",
        ["6966a6d2ea7015c3b8a3d4fd"] = "Mega Millions",
        ["6966a6d2ea7015c3b8a3d503"] = "Powerball",
        ["6966a6d2ea7015c3b8a3d5c0"] = "La Primera",
        ["6966a6d2ea7015c3b8a3d5c6"] = "La Primera Noche",
        ["6966a6d3ea7015c3b8a3d5e3"] = "Quiniela",
        ["6966a6d3ea7015c3b8a3d5e9"] = "La Suerte Dominicana",
        ["6966a6d2ea7015c3b8a3d527"] = "Florida Día",
        ["69fd98465e76585b602695be"] = "Chance Real",
        ["6966a6d2ea7015c3b8a3d4c6"] = "Loto Pool",
        ["6966a6d2ea7015c3b8a3d4cc"] = "Nueva Yol Real",
        ["6966a6d2ea7015c3b8a3d521"] = "Cash 4 Life",
        ["6966a6d2ea7015c3b8a3d4c0"] = "Agarra 4",
        ["6966a6d2ea7015c3b8a3d5cc"] = "Anguila 1:00 PM",
        ["6966a6d2ea7015c3b8a3d5d2"] = "Anguila 6:00 PM",
        ["6966a6d2ea7015c3b8a3d5d8"] = "Anguila 9:00 PM",
        ["6966a6d2ea7015c3b8a3d527b"] = "Anguila 10:00 AM",
    };

    public async Task<List<ResultadoScrapedDto>> ObtenerTodosResultadosAsync()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var json = await http.GetStringAsync("https://api.temp.conectate.com.do/conectate/sessions?limit=1");
            var entries = JsonSerializer.Deserialize<JsonElement>(json);

            var results = new List<ResultadoScrapedDto>();

            foreach (var entry in entries.EnumerateArray())
            {
                var gameId = entry.GetProperty("game_id").GetString() ?? "";
                if (!GameNames.TryGetValue(gameId, out var name)) continue;

                var sessions = entry.GetProperty("sessions");
                if (sessions.GetArrayLength() == 0) continue;

                var session = sessions[0];
                var score = session.GetProperty("score");
                if (score.GetArrayLength() == 0) continue;

                var nums = score[0];
                if (nums.GetArrayLength() < 3) continue;

                if (!int.TryParse(nums[0].GetString(), out var n1) ||
                    !int.TryParse(nums[1].GetString(), out var n2) ||
                    !int.TryParse(nums[2].GetString(), out var n3)) continue;

                var date = session.GetProperty("date").GetString() ?? "";
                var fecha = DateTime.TryParse(date, out var dt) ? dt.ToString("dd-MM-yyyy") : "";

                results.Add(new ResultadoScrapedDto
                {
                    Loteria = name,
                    Primera = n1,
                    Segunda = n2,
                    Tercera = n3,
                    Fecha = fecha
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
