using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class FixUniqueIndexesMultiTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tickets_CodigoTicket",
                table: "tickets");

            migrationBuilder.DropIndex(
                name: "IX_terminales_Codigo",
                table: "terminales");

            migrationBuilder.DropIndex(
                name: "IX_loterias_CodigoCorto",
                table: "loterias");

            migrationBuilder.DropIndex(
                name: "IX_configuraciones_monto_jugada_TipoJugada",
                table: "configuraciones_monto_jugada");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_TenantId_CodigoTicket",
                table: "tickets",
                columns: new[] { "TenantId", "CodigoTicket" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_terminales_TenantId_Codigo",
                table: "terminales",
                columns: new[] { "TenantId", "Codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_loterias_TenantId_CodigoCorto",
                table: "loterias",
                columns: new[] { "TenantId", "CodigoCorto" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_configuraciones_monto_jugada_TenantId_TipoJugada",
                table: "configuraciones_monto_jugada",
                columns: new[] { "TenantId", "TipoJugada" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tickets_TenantId_CodigoTicket",
                table: "tickets");

            migrationBuilder.DropIndex(
                name: "IX_terminales_TenantId_Codigo",
                table: "terminales");

            migrationBuilder.DropIndex(
                name: "IX_loterias_TenantId_CodigoCorto",
                table: "loterias");

            migrationBuilder.DropIndex(
                name: "IX_configuraciones_monto_jugada_TenantId_TipoJugada",
                table: "configuraciones_monto_jugada");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_CodigoTicket",
                table: "tickets",
                column: "CodigoTicket",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_terminales_Codigo",
                table: "terminales",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_loterias_CodigoCorto",
                table: "loterias",
                column: "CodigoCorto",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_configuraciones_monto_jugada_TipoJugada",
                table: "configuraciones_monto_jugada",
                column: "TipoJugada",
                unique: true);
        }
    }
}
