using DH.Enums;
using DH.Exceptions;
using DH.Models.Main;
using DH.Services.Main;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DH.Main.Controllers
{
    [ApiController, AllowAnonymous]
    public sealed class AuthController(ILogger<AuthController> logger, SignInManager<User> signInManager, UserManager<User> userManager, TokenService tokenService) : ControllerBase
    {
        private readonly ILogger<AuthController> _logger = logger;
        private readonly SignInManager<User> _signInManager = signInManager;
        private readonly UserManager<User> _userManager = userManager;
        private readonly TokenService _tokenService = tokenService;

        private const string INVALIDREQUEST = "Invalid username or password.";

        [HttpPost("Api/Admin/Login")]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
        {
            try
            {
                if (!ModelState.IsValid || !AdminLoginDto.IsValidUserName(dto.UserName))   // Validate the dto-model
                    throw new ModelInvalidException($"Given username: {dto.UserName}");

                var user = await _userManager.FindByNameAsync(dto.UserName)
                    ?? throw new UserNotFoundException(dto.UserName);

                var signInResult = await _signInManager.PasswordSignInAsync(user, dto.Password, isPersistent: true, lockoutOnFailure: true);
                if (signInResult.Succeeded)
                {
                    _logger.LogInformation("User {UserId} logged in.", user.Id);
                    var jwtToken = _tokenService.GetTokenString(user);
                    HttpContext.Response.Cookies.Append(CookieType.AuthCookie.ToString(), jwtToken);   // Set the token in a cookie
                }
                else
                    throw new AuthorizationException(user.Id);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(AdminLogin));
                return BadRequest(INVALIDREQUEST);
            }
        }

        [HttpPost("Api/Admin/Logout")]
        public async Task<IActionResult> AdminLogout()
        {
            try
            {
                await _signInManager.SignOutAsync();
                HttpContext.Response.Cookies.Delete(CookieType.AuthCookie.ToString());   // Remove the token from the cookie
                _logger.LogInformation("User logged out.");
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(AdminLogout));
                return BadRequest();
            }
        }

        public class AdminLoginDto()
        {
            public string UserName { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;

            public static bool IsValidUserName(string value)
            {
                if (string.IsNullOrEmpty(value) || value.Length < 5 || value.Length > 50)
                    return false;
                else
                    return true;
            }
        }
    }
}
