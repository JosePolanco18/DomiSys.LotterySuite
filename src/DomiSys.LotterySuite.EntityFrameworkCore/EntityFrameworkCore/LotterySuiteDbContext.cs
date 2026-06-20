using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;

namespace DomiSys.LotterySuite.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ConnectionStringName("Default")]
public class LotterySuiteDbContext :
    AbpDbContext<LotterySuiteDbContext>,
    IIdentityDbContext
{
    #region Loterias

    public DbSet<Loteria> Loterias { get; set; }
    public DbSet<Sorteo> Sorteos { get; set; }
    public DbSet<ResultadoSorteo> ResultadosSorteo { get; set; }
    public DbSet<ConfiguracionPago> ConfiguracionesPago { get; set; }
    public DbSet<ConfiguracionPagoSorteo> ConfiguracionesPagoSorteo { get; set; }
    public DbSet<ConfiguracionMontoJugada> ConfiguracionesMontoJugada { get; set; }

    #endregion

    #region Terminales

    public DbSet<Terminal> Terminales { get; set; }

    #endregion

    #region ControlRiesgo

    public DbSet<LimiteNumero> LimitesNumero { get; set; }
    public DbSet<AcumuladoVentaNumero> AcumuladosVentaNumero { get; set; }

    #endregion

    #region Ventas

    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<DetalleTicket> DetallesTicket { get; set; }

    #endregion

    #region Cuadres

    public DbSet<CuadreTerminal> CuadresTerminal { get; set; }

    #endregion

    #region Configuracion

    public DbSet<ConfiguracionGeneral> ConfiguracionGeneral { get; set; }

    #endregion

    #region Identity

    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    #endregion

    public LotterySuiteDbContext(DbContextOptions<LotterySuiteDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureBlobStoring();
        builder.ConfigureLotterySuite();
    }
}
