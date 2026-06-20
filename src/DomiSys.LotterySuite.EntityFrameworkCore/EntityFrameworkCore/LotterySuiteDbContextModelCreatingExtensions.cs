using DomiSys.LotterySuite.Configuracion;
using DomiSys.LotterySuite.ControlRiesgo;
using DomiSys.LotterySuite.Cuadres;
using DomiSys.LotterySuite.Loterias;
using DomiSys.LotterySuite.Terminales;
using DomiSys.LotterySuite.Ventas;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace DomiSys.LotterySuite.EntityFrameworkCore;

public static class LotterySuiteDbContextModelCreatingExtensions
{
    public static void ConfigureLotterySuite(this ModelBuilder builder)
    {
        // ========== LOTERIA ENTITIES ==========

        builder.Entity<Loteria>(b =>
        {
            b.ToTable("loterias");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            b.Property(x => x.CodigoCorto).IsRequired().HasMaxLength(10);
            b.Property(x => x.LogoUrl).HasMaxLength(500);

            b.HasIndex(x => x.CodigoCorto).IsUnique();
        });

        builder.Entity<Sorteo>(b =>
        {
            b.ToTable("sorteos");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            b.Property(x => x.DiasActivos).IsRequired().HasMaxLength(20);

            b.HasOne(x => x.Loteria)
                .WithMany(x => x.Sorteos)
                .HasForeignKey(x => x.LoteriaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ResultadoSorteo>(b =>
        {
            b.ToTable("resultados_sorteo");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.RegistradoPor).HasMaxLength(256);

            b.HasOne(x => x.Sorteo)
                .WithMany(x => x.Resultados)
                .HasForeignKey(x => x.SorteoId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => new { x.SorteoId, x.Fecha }).IsUnique();
        });

        builder.Entity<ConfiguracionPago>(b =>
        {
            b.ToTable("configuraciones_pago");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.HasOne(x => x.Loteria)
                .WithMany(x => x.ConfiguracionesPago)
                .HasForeignKey(x => x.LoteriaId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => new { x.LoteriaId, x.TipoJugada }).IsUnique();
        });

        builder.Entity<ConfiguracionPagoSorteo>(b =>
        {
            b.ToTable("configuraciones_pago_sorteo");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.QuinielaPrimera).HasPrecision(18, 2);
            b.Property(x => x.QuinielaSegunda).HasPrecision(18, 2);
            b.Property(x => x.QuinielaTercera).HasPrecision(18, 2);
            b.Property(x => x.PalePrimeraSegunda).HasPrecision(18, 2);
            b.Property(x => x.PaleSegundaTercera).HasPrecision(18, 2);
            b.Property(x => x.Tripleta).HasPrecision(18, 2);
            b.Property(x => x.SuperPale).HasPrecision(18, 2);

            b.HasOne(x => x.Sorteo).WithMany().HasForeignKey(x => x.SorteoId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(x => x.SorteoId).IsUnique();
        });

        builder.Entity<ConfiguracionMontoJugada>(b =>
        {
            b.ToTable("configuraciones_monto_jugada");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.HasIndex(x => x.TipoJugada).IsUnique();
        });

        // ========== TERMINAL ENTITIES ==========

        builder.Entity<Terminal>(b =>
        {
            b.ToTable("terminales");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.Codigo).IsRequired().HasMaxLength(20);
            b.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            b.Property(x => x.NombreVendedor).IsRequired().HasMaxLength(200);
            b.Property(x => x.PinVendedor).IsRequired().HasMaxLength(256);
            b.Property(x => x.Ubicacion).HasMaxLength(200);
            b.Property(x => x.Telefono).HasMaxLength(20);
            b.Property(x => x.Notas).HasMaxLength(500);
            b.Property(x => x.PorcentajeComisionVenta).HasPrecision(5, 2);
            b.Property(x => x.PorcentajeComisionVerde).HasPrecision(5, 2);

            b.HasIndex(x => x.Codigo).IsUnique();
        });

        // ========== CONTROL DE RIESGO ENTITIES ==========

        builder.Entity<LimiteNumero>(b =>
        {
            b.ToTable("limites_numero");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.LimiteVentaMaximo).HasPrecision(18, 2);
            b.Property(x => x.LimiteAguante).HasPrecision(18, 2);
            b.Property(x => x.Notas).HasMaxLength(500);

            b.HasOne(x => x.Loteria)
                .WithMany()
                .HasForeignKey(x => x.LoteriaId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Sorteo)
                .WithMany()
                .HasForeignKey(x => x.SorteoId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.SorteoId, x.Numero }).IsUnique();
        });

        builder.Entity<AcumuladoVentaNumero>(b =>
        {
            b.ToTable("acumulados_venta_numero");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.MontoAcumulado).HasPrecision(18, 2);

            b.HasIndex(x => new { x.SorteoId, x.Fecha, x.Numero }).IsUnique();
        });

        // ========== VENTA ENTITIES ==========

        builder.Entity<Ticket>(b =>
        {
            b.ToTable("tickets");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.CodigoTicket).IsRequired().HasMaxLength(30);
            b.Property(x => x.MontoTotal).HasPrecision(18, 2);
            b.Property(x => x.TotalPremios).HasPrecision(18, 2);
            b.Property(x => x.AnuladoPor).HasMaxLength(256);
            b.Property(x => x.MotivoAnulacion).HasMaxLength(500);
            b.Property(x => x.HashVerificacion).IsRequired().HasMaxLength(256);

            b.HasOne(x => x.Terminal)
                .WithMany(x => x.Tickets)
                .HasForeignKey(x => x.TerminalId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.TerminalPago)
                .WithMany()
                .HasForeignKey(x => x.TerminalPagoId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => x.CodigoTicket).IsUnique();
            b.HasIndex(x => new { x.TerminalId, x.FechaCreacion });
        });

        builder.Entity<DetalleTicket>(b =>
        {
            b.ToTable("detalles_ticket");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.Monto).HasPrecision(18, 2);
            b.Property(x => x.MultiplicadorPago).HasPrecision(18, 2);
            b.Property(x => x.MontoPremio).HasPrecision(18, 2);

            b.HasOne(x => x.Ticket)
                .WithMany(x => x.Detalles)
                .HasForeignKey(x => x.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Sorteo)
                .WithMany()
                .HasForeignKey(x => x.SorteoId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.SegundoSorteo)
                .WithMany()
                .HasForeignKey(x => x.SegundoSorteoId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.SorteoId, x.FechaSorteo });
        });

        // ========== CONFIGURACION ENTITIES ==========

        builder.Entity<ConfiguracionGeneral>(b =>
        {
            b.ToTable("configuracion_general");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.ComisionVentaPorDefecto).HasPrecision(5, 2);
            b.Property(x => x.ComisionVerdePorDefecto).HasPrecision(5, 2);
        });

        // ========== CUADRE ENTITIES ==========

        builder.Entity<CuadreTerminal>(b =>
        {
            b.ToTable("cuadres_terminal");
            b.ConfigureByConvention();
            b.HasKey(x => x.Id);

            b.Property(x => x.VentasBrutas).HasPrecision(18, 2);
            b.Property(x => x.TotalPremiosPagados).HasPrecision(18, 2);
            b.Property(x => x.PorcentajeComisionVenta).HasPrecision(5, 2);
            b.Property(x => x.MontoComisionVenta).HasPrecision(18, 2);
            b.Property(x => x.PorcentajeComisionVerde).HasPrecision(5, 2);
            b.Property(x => x.MontoComisionVerde).HasPrecision(18, 2);
            b.Property(x => x.BalanceNeto).HasPrecision(18, 2);
            b.Property(x => x.Notas).HasMaxLength(500);
            b.Property(x => x.CuadradoPor).IsRequired().HasMaxLength(256);

            b.HasOne(x => x.Terminal)
                .WithMany()
                .HasForeignKey(x => x.TerminalId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.TerminalId, x.FechaCuadre });
        });
    }
}
