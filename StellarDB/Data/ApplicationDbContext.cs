using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StellarDB.Models.AuditLog;
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
    // Shto DbSet per modelet e reja ketu
    // public DbSet<Model> Items { get; set; }
}
