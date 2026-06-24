using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class AddLimitesTipoJugada : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "LimitePale",
                table: "configuracion_general",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LimiteQuiniela",
                table: "configuracion_general",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LimiteSuperPale",
                table: "configuracion_general",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LimiteTripleta",
                table: "configuracion_general",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LimitePale",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "LimiteQuiniela",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "LimiteSuperPale",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "LimiteTripleta",
                table: "configuracion_general");
        }
    }
}
