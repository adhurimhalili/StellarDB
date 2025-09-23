using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StellarDB.Models.Identity;

namespace StellarDB.Extensions
{
    public static class AuthorizationPolicyExtensions
    {
        private static readonly HashSet<string> _addedPolicyNames = new();

        public static void AddPolicyWithTracking(this AuthorizationOptions options, string policyName, Action<AuthorizationPolicyBuilder> configurePolicy)
        {
            if (_addedPolicyNames.Add(policyName))
            {
                options.AddPolicy(policyName, configurePolicy);
            }
        }

        public static IEnumerable<string> GetPolicyNames(this AuthorizationOptions options)
        {
            return _addedPolicyNames;
        }
    }
}
