using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DomiSys.LotterySuite.Migrations
{
    /// <inheritdoc />
    public partial class ConfiguracionGeneralAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreationTime",
                table: "configuracion_general",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "configuracion_general",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModificationTime",
                table: "configuracion_general",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifierId",
                table: "configuracion_general",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreationTime",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "LastModificationTime",
                table: "configuracion_general");

            migrationBuilder.DropColumn(
                name: "LastModifierId",
                table: "configuracion_general");
        }
    }
}
