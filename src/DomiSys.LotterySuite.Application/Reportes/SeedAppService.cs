using System;
using System.Threading.Tasks;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace DomiSys.LotterySuite.Reportes;

// ponytail: temporary seeder, delete after initial data load
[Authorize]
public class SeedAppService : ApplicationService
{
    private readonly IRepository<Loteria, Guid> _loteriaRepo;
    private readonly IRepository<Sorteo, Guid> _sorteoRepo;
    private readonly IRepository<ConfiguracionPago, Guid> _configPagoRepo;
    private readonly IRepository<ConfiguracionPagoSorteo, Guid> _configPagoSorteoRepo;
    private readonly IRepository<ConfiguracionMontoJugada, Guid> _configMontoRepo;
    private readonly IRepository<ResultadoSorteo, Guid> _resultadoRepo;
    private readonly IRepository<LimiteNumero, Guid> _limiteRepo;
    private readonly IRepository<AcumuladoVentaNumero, Guid> _acumuladoRepo;
    private readonly IRepository<DetalleTicket, Guid> _detalleRepo;
    private readonly IRepository<Ticket, Guid> _ticketRepo;
    private readonly IRepository<CuadreTerminal, Guid> _cuadreRepo;

    public SeedAppService(
        IRepository<Loteria, Guid> loteriaRepo, IRepository<Sorteo, Guid> sorteoRepo,
        IRepository<ConfiguracionPago, Guid> configPagoRepo, IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepo,
        IRepository<ConfiguracionMontoJugada, Guid> configMontoRepo,
        IRepository<ResultadoSorteo, Guid> resultadoRepo, IRepository<LimiteNumero, Guid> limiteRepo,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepo, IRepository<DetalleTicket, Guid> detalleRepo,
        IRepository<Ticket, Guid> ticketRepo, IRepository<CuadreTerminal, Guid> cuadreRepo)
    {
        _loteriaRepo = loteriaRepo; _sorteoRepo = sorteoRepo;
        _configPagoRepo = configPagoRepo; _configPagoSorteoRepo = configPagoSorteoRepo;
        _configMontoRepo = configMontoRepo;
        _resultadoRepo = resultadoRepo; _limiteRepo = limiteRepo;
        _acumuladoRepo = acumuladoRepo; _detalleRepo = detalleRepo;
        _ticketRepo = ticketRepo; _cuadreRepo = cuadreRepo;
    }

    public async Task<string> SeedLoteriasAsync()
    {
        // Clear all
        await _detalleRepo.DeleteManyAsync(await _detalleRepo.GetListAsync());
        await _ticketRepo.DeleteManyAsync(await _ticketRepo.GetListAsync());
        await _acumuladoRepo.DeleteManyAsync(await _acumuladoRepo.GetListAsync());
        await _limiteRepo.DeleteManyAsync(await _limiteRepo.GetListAsync());
        await _resultadoRepo.DeleteManyAsync(await _resultadoRepo.GetListAsync());
        await _configPagoRepo.DeleteManyAsync(await _configPagoRepo.GetListAsync());
        await _configPagoSorteoRepo.DeleteManyAsync(await _configPagoSorteoRepo.GetListAsync());
        await _configMontoRepo.DeleteManyAsync(await _configMontoRepo.GetListAsync());
        await _cuadreRepo.DeleteManyAsync(await _cuadreRepo.GetListAsync());
        await _sorteoRepo.DeleteManyAsync(await _sorteoRepo.GetListAsync());
        await _loteriaRepo.DeleteManyAsync(await _loteriaRepo.GetListAsync());

        // Loterias
        var ln = new Loteria(Guid.NewGuid(), "Lotería Nacional", "LN", 1);
        var le = new Loteria(Guid.NewGuid(), "Leidsa", "LE", 2);
        var lr = new Loteria(Guid.NewGuid(), "Lotería Real", "LR", 3);
        var lk = new Loteria(Guid.NewGuid(), "Loteka", "LK", 4);
        var lp = new Loteria(Guid.NewGuid(), "La Primera", "LP", 5);
        var ls = new Loteria(Guid.NewGuid(), "La Suerte", "LS", 6);
        var ld = new Loteria(Guid.NewGuid(), "LoteDom", "LD", 7);
        var an = new Loteria(Guid.NewGuid(), "Anguila", "AN", 8);
        var kl = new Loteria(Guid.NewGuid(), "King Lottery", "KL", 9);
        var ny = new Loteria(Guid.NewGuid(), "Americana (NY)", "NY", 10);
        var fl = new Loteria(Guid.NewGuid(), "Florida", "FL", 11);

        var loterias = new[] { ln, le, lr, lk, lp, ls, ld, an, kl, ny, fl };
        await _loteriaRepo.InsertManyAsync(loterias, autoSave: true);

        var dias = "L,M,Mi,J,V,S";

        // Sorteos
        var sorteos = new Sorteo[]
        {
            new(Guid.NewGuid(), ln.Id, "Gana Más", dias, ts("08:00"), ts("14:25"), ts("14:30"), 15),
            new(Guid.NewGuid(), ln.Id, "Lotería Nacional", dias, ts("08:00"), ts("20:50"), ts("21:00"), 15),
            new(Guid.NewGuid(), ln.Id, "Juega + Pega +", dias, ts("08:00"), ts("20:50"), ts("21:00"), 15),

            new(Guid.NewGuid(), le.Id, "Quiniela Leidsa", dias, ts("08:00"), ts("20:50"), ts("20:55"), 15),
            new(Guid.NewGuid(), le.Id, "Pega 3 Más", dias, ts("08:00"), ts("20:50"), ts("20:55"), 15),
            new(Guid.NewGuid(), le.Id, "Loto Pool", dias, ts("08:00"), ts("20:50"), ts("20:55"), 15),
            new(Guid.NewGuid(), le.Id, "Super Kino TV", dias, ts("08:00"), ts("20:50"), ts("20:55"), 15),

            new(Guid.NewGuid(), lr.Id, "Quiniela Real", dias, ts("08:00"), ts("12:50"), ts("12:55"), 15),

            new(Guid.NewGuid(), lk.Id, "Quiniela Loteka", dias, ts("08:00"), ts("19:50"), ts("19:55"), 15),
            new(Guid.NewGuid(), lk.Id, "Mega Chances", dias, ts("08:00"), ts("19:50"), ts("19:55"), 15),

            new(Guid.NewGuid(), lp.Id, "La Primera Día", dias, ts("08:00"), ts("11:55"), ts("12:00"), 15),
            new(Guid.NewGuid(), lp.Id, "Primera Noche", dias, ts("08:00"), ts("19:55"), ts("20:00"), 15),

            new(Guid.NewGuid(), ls.Id, "La Suerte", dias, ts("08:00"), ts("12:25"), ts("12:30"), 15),

            new(Guid.NewGuid(), ld.Id, "LoteDom", dias, ts("08:00"), ts("13:50"), ts("13:55"), 15),

            new(Guid.NewGuid(), an.Id, "Anguila 10:00 AM", dias, ts("08:00"), ts("09:55"), ts("10:00"), 15),
            new(Guid.NewGuid(), an.Id, "Anguila 1:00 PM", dias, ts("08:00"), ts("12:55"), ts("13:00"), 15),
            new(Guid.NewGuid(), an.Id, "Anguila 6:00 PM", dias, ts("08:00"), ts("17:55"), ts("18:00"), 15),
            new(Guid.NewGuid(), an.Id, "Anguila 9:00 PM", dias, ts("08:00"), ts("20:55"), ts("21:00"), 15),

            new(Guid.NewGuid(), kl.Id, "King Lottery 12:30", dias, ts("08:00"), ts("12:25"), ts("12:30"), 15),
            new(Guid.NewGuid(), kl.Id, "King Lottery 7:30", dias, ts("08:00"), ts("19:25"), ts("19:30"), 15),

            new(Guid.NewGuid(), ny.Id, "New York Tarde", dias, ts("08:00"), ts("14:25"), ts("14:30"), 20),
            new(Guid.NewGuid(), ny.Id, "New York Noche", dias, ts("08:00"), ts("22:25"), ts("22:30"), 20),

            new(Guid.NewGuid(), fl.Id, "Florida Día", dias, ts("08:00"), ts("13:25"), ts("13:30"), 20),
            new(Guid.NewGuid(), fl.Id, "Florida Noche", dias, ts("08:00"), ts("21:45"), ts("21:50"), 20),
        };
        await _sorteoRepo.InsertManyAsync(sorteos, autoSave: true);

        // Config pagos por sorteo (position-based)
        foreach (var sorteo in sorteos)
        {
            await _configPagoSorteoRepo.InsertAsync(new ConfiguracionPagoSorteo(Guid.NewGuid(), sorteo.Id));
        }

        // Config pagos default para todas (legacy)
        foreach (var lot in loterias)
        {
            await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Quiniela, 70));
            await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Pale, 700));
            await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Tripleta, 5000));
            await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.SuperPale, 700));
        }

        // Config montos
        await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Quiniela, 1, 10000));
        await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Pale, 1, 5000));
        await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Tripleta, 1, 2000));
        await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.SuperPale, 1, 5000));

        return $"Seed completado: {loterias.Length} loterías, {sorteos.Length} sorteos, {sorteos.Length} config pagos sorteo, {loterias.Length * 4} config pagos legacy, 4 config montos";
    }

    private static TimeSpan ts(string hhmm) => TimeSpan.Parse(hhmm);
}
