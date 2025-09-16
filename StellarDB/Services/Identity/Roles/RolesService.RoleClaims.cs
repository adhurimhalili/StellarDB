using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Roles;
using System.Security.Claims;

namespace StellarDB.Services.Identity.Roles
{
    internal partial class RolesService
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        public RolesService()
        {

        }
    }
}
