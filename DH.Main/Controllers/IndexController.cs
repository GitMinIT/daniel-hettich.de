using DH.Models.Views;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace DH.Main.Controllers
{
    public sealed class IndexController(ILogger<IndexController> logger) : Controller
    {
        private readonly ILogger<IndexController> _logger = logger;

        [HttpGet("/"), HttpGet("/Index")]
        public async Task<IActionResult> Index(CancellationToken cancellationToken)
        {
            IActionResult result = BadRequest(500);
            try
            {
                result = await Task.FromResult(View());
            }
            catch (TaskCanceledException)
            {
                _logger.LogDebug("Admin call cancelled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Index");
                throw;
            }
            return result;
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("/Error")]
        public async Task<IActionResult> Error(CancellationToken cancellationToken)
        {
            IActionResult result = BadRequest(500);
            try
            {
                _logger.LogError("Error page visited");
                result = await Task.FromResult(View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier }));
            }
            catch (TaskCanceledException)
            {
                _logger.LogDebug("Admin call cancelled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin");
                throw;
            }
            return result;
        }
    }
}
