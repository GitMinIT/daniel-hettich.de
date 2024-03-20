using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DH.Main.Controllers
{
    [Authorize]
    public sealed class AdminController() : Controller
    {
        [HttpGet("/Admin"), HttpGet("/Admin/Index"), AllowAnonymous]
        public IActionResult Index()
        {
            bool isAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
            if (!isAuthenticated)
                return RedirectToAction(nameof(Login));

            return View();
        }

        [HttpGet("/Admin/Login"), AllowAnonymous]
        public IActionResult Login()
        {
            bool isAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
            if (isAuthenticated)
                return RedirectToAction(nameof(Index));

            return View();
        }

        [HttpGet("/Admin/Tests")]
        public IActionResult Tests() => View();
    }
}
