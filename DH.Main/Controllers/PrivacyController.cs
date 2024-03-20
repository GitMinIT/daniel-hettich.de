using Microsoft.AspNetCore.Mvc;

namespace DH.Main.Controllers
{
    public sealed class PrivacyController(ILogger<PrivacyController> logger) : Controller
    {
        private readonly ILogger<PrivacyController> _logger = logger;

        [HttpGet("/Impressum")]
        public IActionResult Impressum() => View();
    }
}
