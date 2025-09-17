namespace StellarDB.Models.Identity.Roles
{
    public class RoleViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RoleClaimModel> RoleClaims { get; set; } = new List<RoleClaimModel>();
    }

    public class RoleClaimModel 
    {         
        public string ClaimType { get; set; }
        public string ClaimValue { get; set; }
    }
}
