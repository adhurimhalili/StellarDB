using StellarDB.Services.AuditLog;

namespace StellarDB.Middlewares
{
    public class AuditLogMiddleware
    {
        private readonly RequestDelegate _next;
        public AuditLogMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, IAuditLogServices auditLogServices)
        {
            var userId = context.User?.Identity?.IsAuthenticated == true ? context.User.Identity.Name : "Anonymous";
            await _next(context);

            // Only log if the request is for an API controller endpoint or /api/AuditLog
            if (context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.Equals("/api/AuditLog", StringComparison.OrdinalIgnoreCase))
            {
                var ipAddress = context.Connection.RemoteIpAddress?.ToString();

                string? entityId = context.Request.RouteValues["id"]?.ToString();
                string? entityName = context.Request.Path.Value.Split('/')[2];
                string? correlationId = CorrelationIdHelper.GetCorrelationId(context);

                await auditLogServices.LogAsync(
                    action: context.Request.Method,
                    description: $"Accessed {context.Request.Path}",
                    ipAddress: ipAddress,
                    entityId: entityId,
                    entityName: entityName,
                    userAgent: context.Request.Headers["User-Agent"],
                    userId: userId,
                    correlationId: correlationId
                );
            }
        }
    }

    public static class CorrelationIdHelper
    {
        public const string CorrelationIdHeader = "X-Correlation-ID";

        public static string? GetCorrelationId(HttpContext context)
        {
            return context.Items.TryGetValue(CorrelationIdHeader, out var value) ? value?.ToString() : null;
        }
    }
}
