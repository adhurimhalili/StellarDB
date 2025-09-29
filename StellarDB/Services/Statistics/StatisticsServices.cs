using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.AuditLog;
using StellarDB.Models.Planet;
using StellarDB.Models.PlanetTypes;

namespace StellarDB.Services.Statistics
{
    public class StatisticsServices : IStatisticsServices
    {
        private readonly IMongoCollection<PlanetModel> _planets;
        private readonly IMongoCollection<PlanetTypesModel> _planetTypes;
        private readonly IMongoCollection<AuditLogModel> _auditLogs;
        private readonly ApplicationDbContext _context;
        public StatisticsServices(MongoDbService mongoDbService, ApplicationDbContext context)
        {
            _planets = mongoDbService.Database!.GetCollection<PlanetModel>("Planets");
            _planetTypes = mongoDbService.Database!.GetCollection<PlanetTypesModel>("PlanetTypes");
            _context = context;
        }

        public async Task<IDictionary<string, int>> GetPlanetCountByTypeAsync()
        {
            // Aggregate planet counts by type id
            var group = await _planets.Aggregate()
                .Group(p => p.PlanetTypeId, g => new { PlanetTypeId = g.Key, Count = g.Count() })
                .ToListAsync();

            // Get all planet types
            var types = await _planetTypes.Find(_ => true).ToListAsync();
            var typeDict = types.ToDictionary(t => t.Id, t => t.Name);

            // Map type id to type name and count
            var result = new Dictionary<string, int>();
            foreach (var item in group)
            {
                if (typeDict.TryGetValue(item.PlanetTypeId, out var typeName))
                {
                    result[typeName] = item.Count;
                }
                else
                {
                    result["Unknown"] = result.TryGetValue("Unknown", out var c) ? c + item.Count : item.Count;
                }
            }
            return result;
        }

        public async Task<IDictionary<string, int>> GetUserCountByRoleAsync()
        {
            // Get all roles with their associated user counts
            var usersByRole = await _context.UserRoles
                .GroupBy(ur => ur.RoleId)
                .Select(g => new
                {
                    RoleId = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // Get all role names for mapping
            var roleDict = await _context.Roles
                .ToDictionaryAsync(r => r.Id, r => r.Name);

            // Create the result dictionary mapping role names to user counts
            var result = new Dictionary<string, int>();
            foreach (var item in usersByRole)
            {
                if (roleDict.TryGetValue(item.RoleId, out var roleName) && roleName != null)
                {
                    result[roleName] = item.Count;
                }
            }

            // Include users with no roles (if any)
            var totalUsers = await _context.Users.CountAsync();
            var usersWithRoles = usersByRole.Sum(ur => ur.Count);
            if (totalUsers > usersWithRoles)
            {
                result["Unassigned"] = totalUsers - usersWithRoles;
            }

            return result;
        }

        public async Task<IDictionary<string, int>> GetUserActivityAsync()
        {
            // Get the date for 7 days ago from today
            var startDate = DateTime.UtcNow.Date.AddDays(-6); // Last 7 days including today

            // Filter audit logs for the past 7 days and aggregate by day
            var activityLogs = await _context.AuditLogs
                .Where(log => log.Timestamp >= startDate) // Use LINQ's Where method to filter logs
                .ToListAsync();

            // Initialize dictionary with all 7 days (to ensure we have entries even for days with no activity)
            var result = new Dictionary<string, int>();
            for (int i = 0; i < 7; i++)
            {
                var day = startDate.AddDays(i).ToString("yyyy-MM-dd");
                result[day] = 0;
            }

            // Group and count logs by day
            var groupedByDay = activityLogs
                .GroupBy(log => log.Timestamp.Date)
                .Select(g => new
                {
                    Day = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                });

            // Update the result dictionary with the actual counts
            foreach (var day in groupedByDay)
            {
                result[day.Day] = day.Count;
            }

            return result;
        }

        public async Task<IDictionary<string, int>> GetEntityActivity()
        {
            // Get all audit logs
            var auditLogs = await _context.AuditLogs.ToListAsync();

            // Group logs by entity name (which represents the API endpoint)
            var result = auditLogs
                .Where(log => !string.IsNullOrEmpty(log.EntityName))
                .GroupBy(log => log.EntityName!)
                .ToDictionary(
                    group => group.Key,
                    group => group.Count()
                );

            // Sort by count in descending order
            return result.OrderByDescending(x => x.Value)
                        .ToDictionary(x => x.Key, x => x.Value);
        }
    }
}
