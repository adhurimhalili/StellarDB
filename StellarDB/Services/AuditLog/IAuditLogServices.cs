namespace StellarDB.Services.AuditLog
{
    public interface IAuditLogServices
    {
        Task LogAsync(
            string action, 
            string description,
            string ipAddress,
            string? entityId,
            string? entityName, 
            string? userAgent = null, 
            string? userId = null,
            string? correlationId = null);
    }
}
