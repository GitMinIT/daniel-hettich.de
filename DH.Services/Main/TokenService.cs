using DH.DAL;
using DH.Models.Main;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DH.Services.Main
{
    public sealed class TokenService(ILogger<TokenService> logger, IConfiguration config, MainDbContext mainContext)
    {
        private readonly ILogger<TokenService> _logger = logger;
        private readonly IConfiguration _config = config;
        private readonly MainDbContext _mainContext = mainContext;

        public SecurityToken? GenerateJWTToken(User user)
        {
            _logger.LogDebug(nameof(GenerateJWTToken));
            if (user == null)
                throw new ArgumentException("User cannot be null", nameof(user));

            SecurityToken? token = default;

            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]
                    ?? throw new ArgumentException("Missing Jwt-Key")));
                var issuer = _config["Jwt:Issuer"]
                    ?? throw new ArgumentException("Missing Jwt-Issuer");
                var audience = _config["Jwt:Audience"]
                    ?? throw new ArgumentException("Missing Jwt-Audience");

                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new (ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new (ClaimTypes.Name, user.UserName ?? string.Empty),
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = credentials,
                    Issuer = issuer,
                    Audience = audience
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                token = tokenHandler.CreateToken(tokenDescriptor);
                _logger.LogInformation("Token created successfully for {user}", user.UserName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GenerateJWTToken));
            }

            return token;
        }

        public string GetTokenString(User user)
        {
            SecurityToken? token = GenerateJWTToken(user);

            if (token is not null)
                return new JwtSecurityTokenHandler().WriteToken(token);
            else
                return string.Empty;
        }
    }
}
