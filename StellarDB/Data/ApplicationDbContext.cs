using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StellarDB.Models.Asistenti;
using StellarDB.Models.AuditLog;
using StellarDB.Models.Departamenti;
using StellarDB.Models.Eventi;
using StellarDB.Models.Festivali;
using StellarDB.Models.Identity;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    { }
    public DbSet<AuditLogModel> AuditLogs { get; set; }
    public DbSet<FestivaliModel> Festivali { get; set; }
    public DbSet<EventiModel> Eventi { get; set; }
    public DbSet<DepartamentiModel> Departamenti { get; set; }
    public DbSet<AsistentiModel> Asistenti { get; set; }
    // Shto DbSet per modelet e reja ketu
    // public DbSet<Model> Items { get; set; }
}
