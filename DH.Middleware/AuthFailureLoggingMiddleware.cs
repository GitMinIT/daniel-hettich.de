using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DH.Middleware
{
    public class AuthFailureLoggingMiddleware(RequestDelegate next, ILogger<AuthFailureLoggingMiddleware> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<AuthFailureLoggingMiddleware> _logger = logger;

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);

                if (context.Response.StatusCode == 401 || context.Response.StatusCode == 403)
                {
                    string ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;

                    string token = "No token provided";
                    if (context.Request.Headers.ContainsKey("Authorization"))
                        token = context.Request.Headers["Authorization"].ToString();

                    _logger.LogWarning("Authorization failed ({StatusCode}) for path: {Path} by IP-Address: {IpAddress}. Token used: {Token}", context.Response.StatusCode, context.Request.Path, ipAddress, token);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(Invoke));
                throw;
            }
        }
    }
}