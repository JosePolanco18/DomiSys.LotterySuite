using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class AddTerminalLimitesYPermisos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LimiteCuadre",
                table: "terminales",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LimiteVentaDiaria",
                table: "terminales",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PuedePagarGanadores",
                table: "terminales",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LimiteCuadre",
                table: "terminales");

            migrationBuilder.DropColumn(
                name: "LimiteVentaDiaria",
                table: "terminales");

            migrationBuilder.DropColumn(
                name: "PuedePagarGanadores",
                table: "terminales");
        }
    }
}
