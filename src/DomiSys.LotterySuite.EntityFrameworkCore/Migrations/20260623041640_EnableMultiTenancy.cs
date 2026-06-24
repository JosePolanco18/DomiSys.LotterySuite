using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class EnableMultiTenancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "tickets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "terminales",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "sorteos",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "resultados_sorteo",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "loterias",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "limites_numero",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "detalles_ticket",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "cuadres_terminal",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "configuraciones_pago_sorteo",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "configuraciones_pago",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "configuraciones_monto_jugada",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "configuracion_general",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "acumulados_venta_numero",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "terminales");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "sorteos");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "resultados_sorteo");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "loterias");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "limites_numero");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "detalles_ticket");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "cuadres_terminal");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "configuraciones_pago_sorteo");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "configuraciones_pago");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "configuraciones_monto_jugada");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "acumulados_venta_numero");
        }
    }
}
