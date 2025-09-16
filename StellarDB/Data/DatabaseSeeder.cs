using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using StellarDB.Models.Identity;

namespace StellarDB.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedDatabaseAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();

            // Get the database context and migrate
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await MigrateDatabaseAsync(context);

            // Check if seeding is needed before proceeding
            if (await SeedingRequiredAsync(scope.ServiceProvider))
            {
                // Seed roles and users
                await SeedRolesAsync(scope.ServiceProvider);
                await SeedUsersAsync(scope.ServiceProvider);
            }
        } // +2,800ms start

        private static async Task<bool> SeedingRequiredAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // Check if any of the required roles exist
            string[] requiredRoles = new[] { "Admin", "Manager", "User" };
            bool hasAnyRole = false;
            foreach (var roleName in requiredRoles)
            {
                if (await roleManager.RoleExistsAsync(roleName))
                {
                    hasAnyRole = true;
                    break;
                }
            }

            // Check if any of the seed users exist
            bool hasAnyUser = await userManager.FindByEmailAsync("admin@stellardb.com") != null ||
                             await userManager.FindByEmailAsync("manager@stellardb.com") != null;

            // Return true if seeding is needed (no roles or users exist)
            return !hasAnyRole || !hasAnyUser;
        }

        private static async Task MigrateDatabaseAsync(ApplicationDbContext context)
        {
            try
            {
                await context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                // Get logger and log the error
                var logger = context.GetService<ILogger<ApplicationDbContext>>();
                logger?.LogError(ex, "An error occurred while migrating the database.");
                throw; // Re-throw the exception to prevent the application from starting with an unmigrated database
            }
        }

        private static async Task SeedRolesAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

            string[] roles = new[] { "Admin", "Manager", "User" };

            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new ApplicationRole(roleName, $"Default {roleName} role"));
                }
            }
        }

        private static async Task SeedUsersAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (await userManager.FindByEmailAsync("admin@stellardb.com") == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = "admin@stellardb.com",
                    FirstName = "System",
                    LastName = "Administrator",
                    EmailConfirmed = true,
                    Active = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            if (await userManager.FindByEmailAsync("manager@stellardb.com") == null)
            {
                var managerUser = new ApplicationUser
                {
                    UserName = "manager",
                    Email = "manager@stellardb.com",
                    FirstName = "System",
                    LastName = "Manager",
                    EmailConfirmed = true,
                    Active = true
                };

                var result = await userManager.CreateAsync(managerUser, "Manager123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(managerUser, "Manager");
                }
            }
        }
    }
}
