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
            string? userId = null;
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                userId = context.User.Claims.FirstOrDefault(c =>
                    c.Type == "sub" ||
                    c.Type == "user_id" ||
                    c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value ?? context.User.Identity.Name;
            }
            else
            {
                userId = "Anonymous";
            }

            await _next(context);

            // Only log if the request is for an API controller endpoint or /api/AuditLog
            if (context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.Equals("/api/AuditLogs", StringComparison.OrdinalIgnoreCase))
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
