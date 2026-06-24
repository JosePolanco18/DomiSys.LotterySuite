using System;
using System.Linq;
using System.Threading.Tasks;
using DomiSys.LotterySuite.GestionEfectivo;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.TenantManagement;

namespace DomiSys.LotterySuite.Reportes;

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
    private readonly IRepository<MovimientoEfectivo, Guid> _movimientoRepo;
    private readonly IRepository<Terminal, Guid> _terminalRepo;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentTenant _currentTenant;

    public SeedAppService(
        IRepository<Loteria, Guid> loteriaRepo,
        IRepository<Sorteo, Guid> sorteoRepo,
        IRepository<ConfiguracionPago, Guid> configPagoRepo,
        IRepository<ConfiguracionPagoSorteo, Guid> configPagoSorteoRepo,
        IRepository<ConfiguracionMontoJugada, Guid> configMontoRepo,
        IRepository<ResultadoSorteo, Guid> resultadoRepo,
        IRepository<LimiteNumero, Guid> limiteRepo,
        IRepository<AcumuladoVentaNumero, Guid> acumuladoRepo,
        IRepository<DetalleTicket, Guid> detalleRepo,
        IRepository<Ticket, Guid> ticketRepo,
        IRepository<CuadreTerminal, Guid> cuadreRepo,
        IRepository<MovimientoEfectivo, Guid> movimientoRepo,
        IRepository<Terminal, Guid> terminalRepo,
        ITenantRepository tenantRepository,
        ICurrentTenant currentTenant)
    {
        _loteriaRepo = loteriaRepo;
        _sorteoRepo = sorteoRepo;
        _configPagoRepo = configPagoRepo;
        _configPagoSorteoRepo = configPagoSorteoRepo;
        _configMontoRepo = configMontoRepo;
        _resultadoRepo = resultadoRepo;
        _limiteRepo = limiteRepo;
        _acumuladoRepo = acumuladoRepo;
        _detalleRepo = detalleRepo;
        _ticketRepo = ticketRepo;
        _cuadreRepo = cuadreRepo;
        _movimientoRepo = movimientoRepo;
        _terminalRepo = terminalRepo;
        _tenantRepository = tenantRepository;
        _currentTenant = currentTenant;
    }

    public async Task<string> SeedLoteriasAsync(string tenantName)
    {
        if (string.IsNullOrWhiteSpace(tenantName))
            throw new UserFriendlyException("Debe indicar el nombre del tenant.");

        var tenants = await _tenantRepository.GetListAsync();
        var tenant = tenants.FirstOrDefault(t => t.Name.Equals(tenantName, StringComparison.OrdinalIgnoreCase));
        if (tenant == null)
            throw new UserFriendlyException("Tenant '" + tenantName + "' no encontrado.");

        using (_currentTenant.Change(tenant.Id))
        {
            // 1. Limpiar todo lo transaccional
            await _movimientoRepo.DeleteManyAsync(await _movimientoRepo.GetListAsync());
            await _detalleRepo.DeleteManyAsync(await _detalleRepo.GetListAsync());
            await _ticketRepo.DeleteManyAsync(await _ticketRepo.GetListAsync());
            await _cuadreRepo.DeleteManyAsync(await _cuadreRepo.GetListAsync());
            await _acumuladoRepo.DeleteManyAsync(await _acumuladoRepo.GetListAsync());
            await _limiteRepo.DeleteManyAsync(await _limiteRepo.GetListAsync());
            await _resultadoRepo.DeleteManyAsync(await _resultadoRepo.GetListAsync());

            // 2. Limpiar configuraciones y loterias/sorteos
            await _configPagoRepo.DeleteManyAsync(await _configPagoRepo.GetListAsync());
            await _configPagoSorteoRepo.DeleteManyAsync(await _configPagoSorteoRepo.GetListAsync());
            await _configMontoRepo.DeleteManyAsync(await _configMontoRepo.GetListAsync());
            await _sorteoRepo.DeleteManyAsync(await _sorteoRepo.GetListAsync());
            await _loteriaRepo.DeleteManyAsync(await _loteriaRepo.GetListAsync());

            // 3. Reset saldo terminales
            var terminales = await _terminalRepo.GetListAsync();
            foreach (var t in terminales)
            {
                t.SaldoEfectivo = 0;
            }
            if (terminales.Any())
                await _terminalRepo.UpdateManyAsync(terminales, autoSave: true);

            // 4. Crear loterias
            var ln = new Loteria(Guid.NewGuid(), "Loteria Nacional", "LN", 1);
            var le = new Loteria(Guid.NewGuid(), "Leidsa", "LE", 2);
            var lr = new Loteria(Guid.NewGuid(), "Loteria Real", "LR", 3);
            var lk = new Loteria(Guid.NewGuid(), "Loteka", "LK", 4);
            var lp = new Loteria(Guid.NewGuid(), "La Primera", "LP", 5);
            var ls = new Loteria(Guid.NewGuid(), "La Suerte Dominicana", "LS", 6);
            var ld = new Loteria(Guid.NewGuid(), "LoteDom", "LD", 7);
            var an = new Loteria(Guid.NewGuid(), "Anguila", "AN", 8);
            var kl = new Loteria(Guid.NewGuid(), "King Lottery", "KL", 9);
            var ny = new Loteria(Guid.NewGuid(), "Americana (NY)", "NY", 10);
            var fl = new Loteria(Guid.NewGuid(), "Florida", "FL", 11);

            var loterias = new[] { ln, le, lr, lk, lp, ls, ld, an, kl, ny, fl };
            await _loteriaRepo.InsertManyAsync(loterias, autoSave: true);

            // 5. Crear sorteos
            var dias = "L,M,Mi,J,V,S";
            var apertura = TimeSpan.Parse("08:00");

            var sorteos = new Sorteo[]
            {
                new(Guid.NewGuid(), ln.Id, "Gana Mas", dias, apertura, Ts("14:25"), Ts("14:30"), 15),
                new(Guid.NewGuid(), ln.Id, "Loteria Nacional", "L,M,Mi,J,V,S,D", apertura, Ts("20:50"), Ts("21:00"), 15),
                new(Guid.NewGuid(), ln.Id, "Juega + Pega +", dias, apertura, Ts("20:50"), Ts("21:00"), 15),
                new(Guid.NewGuid(), ln.Id, "Pega 3 Mas", dias, apertura, Ts("20:50"), Ts("20:55"), 15),

                new(Guid.NewGuid(), le.Id, "Quiniela Leidsa", dias, apertura, Ts("20:50"), Ts("20:55"), 15),
                new(Guid.NewGuid(), le.Id, "Loto Pool", dias, apertura, Ts("20:50"), Ts("20:55"), 15),
                new(Guid.NewGuid(), le.Id, "Super Kino TV", dias, apertura, Ts("20:50"), Ts("20:55"), 15),

                new(Guid.NewGuid(), lr.Id, "Quiniela Real", dias, apertura, Ts("12:50"), Ts("12:55"), 15),
                new(Guid.NewGuid(), lr.Id, "Loto Real", dias, apertura, Ts("12:50"), Ts("12:55"), 15),

                new(Guid.NewGuid(), lk.Id, "Quiniela Loteka", dias, apertura, Ts("19:50"), Ts("19:55"), 15),
                new(Guid.NewGuid(), lk.Id, "Mega Chances", dias, apertura, Ts("19:50"), Ts("19:55"), 15),

                new(Guid.NewGuid(), lp.Id, "La Primera Dia", dias, apertura, Ts("11:55"), Ts("12:00"), 15),
                new(Guid.NewGuid(), lp.Id, "Primera Noche", dias, apertura, Ts("19:55"), Ts("20:00"), 15),

                new(Guid.NewGuid(), ls.Id, "La Suerte Dominicana", dias, apertura, Ts("12:25"), Ts("12:30"), 15),

                new(Guid.NewGuid(), ld.Id, "LoteDom", dias, apertura, Ts("13:50"), Ts("13:55"), 15),

                new(Guid.NewGuid(), an.Id, "Anguila 10:00 AM", dias, apertura, Ts("09:55"), Ts("10:00"), 15),
                new(Guid.NewGuid(), an.Id, "Anguila 1:00 PM", dias, apertura, Ts("12:55"), Ts("13:00"), 15),
                new(Guid.NewGuid(), an.Id, "Anguila 6:00 PM", dias, apertura, Ts("17:55"), Ts("18:00"), 15),
                new(Guid.NewGuid(), an.Id, "Anguila 9:00 PM", dias, apertura, Ts("20:55"), Ts("21:00"), 15),

                new(Guid.NewGuid(), kl.Id, "King Lottery 12:30", dias, apertura, Ts("12:25"), Ts("12:30"), 15),
                new(Guid.NewGuid(), kl.Id, "King Lottery 7:30", dias, apertura, Ts("19:25"), Ts("19:30"), 15),

                new(Guid.NewGuid(), ny.Id, "New York Tarde", dias, apertura, Ts("14:25"), Ts("14:30"), 20),
                new(Guid.NewGuid(), ny.Id, "New York Noche", dias, apertura, Ts("22:25"), Ts("22:30"), 20),

                new(Guid.NewGuid(), fl.Id, "Florida Dia", dias, apertura, Ts("13:25"), Ts("13:30"), 20),
                new(Guid.NewGuid(), fl.Id, "Florida Noche", dias, apertura, Ts("21:45"), Ts("21:50"), 20),
            };
            await _sorteoRepo.InsertManyAsync(sorteos, autoSave: true);

            // 6. Config pagos por sorteo
            foreach (var sorteo in sorteos)
                await _configPagoSorteoRepo.InsertAsync(new ConfiguracionPagoSorteo(Guid.NewGuid(), sorteo.Id));

            // 7. Config pagos legacy
            foreach (var lot in loterias)
            {
                await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Quiniela, 70));
                await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Pale, 700));
                await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.Tripleta, 5000));
                await _configPagoRepo.InsertAsync(new ConfiguracionPago(Guid.NewGuid(), lot.Id, TipoJugada.SuperPale, 700));
            }

            // 8. Config montos minimo 1 peso
            await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Quiniela, 1, 10000));
            await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Pale, 1, 5000));
            await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.Tripleta, 1, 2000));
            await _configMontoRepo.InsertAsync(new ConfiguracionMontoJugada(Guid.NewGuid(), TipoJugada.SuperPale, 1, 5000));

            return "Seed completado: " + loterias.Length + " loterias, " + sorteos.Length + " sorteos, "
                + sorteos.Length + " config pagos sorteo, " + (loterias.Length * 4) + " config pagos legacy, 4 config montos. "
                + "Saldo de " + terminales.Count + " terminal(es) reseteado a 0.";
        }
    }

    private static TimeSpan Ts(string hhmm) => TimeSpan.Parse(hhmm);
}
