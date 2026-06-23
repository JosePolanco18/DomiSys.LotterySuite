using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class AddDatosTicketConfiguracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NombreEmpresa",
                table: "configuracion_general",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PieTicket",
                table: "configuracion_general",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefonoEmpresa",
                table: "configuracion_general",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NombreEmpresa",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "PieTicket",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "TelefonoEmpresa",
                table: "configuracion_general");
        }
    }
}
