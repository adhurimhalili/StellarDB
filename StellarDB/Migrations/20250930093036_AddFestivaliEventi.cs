using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StellarDB.Migrations
{
    /// <inheritdoc />
    public partial class AddFestivaliEventi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Eventi",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmriEventit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Orari = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Id_festivali = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eventi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Festivali",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmriFestivalit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LlojiFestivalit = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Festivali", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Eventi");

            migrationBuilder.DropTable(
                name: "Festivali");
        }
    }
}
