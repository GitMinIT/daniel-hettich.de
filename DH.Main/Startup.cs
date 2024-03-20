using DH.DAL;
using DH.Enums;
using DH.Middleware;
using DH.Models.Main;
using DH.Services.Main;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

namespace DH.Main
{
    public sealed class Startup
    {
        public static WebApplication ConfigureServices(WebApplicationBuilder builder, IConfiguration config)
        {
            builder.Services.AddSerilog();

            #region Entity Framework
            string connectionString = config.GetConnectionString("MainConnection")
                ?? throw new ArgumentException("ConnectionString is missing");

            builder.Services.AddDbContext<MainDbContext>(options =>
            {
                options.UseSqlServer(connectionString);
                options.EnableServiceProviderCaching(false);   // Disable caching to ensure migrations are applied at startup
            });
            #endregion

            #region Identity Service
            builder.Services.AddIdentity<User, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                options.User.RequireUniqueEmail = true;

                // Sign-in settings
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
            })
            .AddEntityFrameworkStores<MainDbContext>()
            .AddDefaultTokenProviders();
            #endregion

            #region Security
            string issuer = config["Jwt:Issuer"] ?? throw new ArgumentException("Missing JWT-Issuer");
            string audience = config["Jwt:Audience"] ?? throw new ArgumentException("Missing JWT-Audience");
            string key = config["Jwt:Key"] ?? throw new ArgumentException("Missing JWT-Key");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = issuer,
                        ValidAudience = audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            if (context.Request.Cookies.ContainsKey(CookieType.AuthCookie.ToString()))
                            {
                                context.Token = context.Request.Cookies[CookieType.AuthCookie.ToString()];
                            }
                            return Task.CompletedTask;
                        }
                    };
                })
                .AddCookie(options =>
                {
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Strict;
                    options.ExpireTimeSpan = TimeSpan.FromDays(7);
                });
            builder.Services.AddAuthorization();

            builder.Services.AddHttpsRedirection(options =>   // Redirects all http-requests to https
            {
                options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
            });

            builder.Services.AddScoped<TokenService>();
            #endregion

            builder.Services.AddControllersWithViews();

#if DEBUG
            builder.Services.AddSwaggerGen(o =>
            {
                o.SwaggerDoc("v1", new OpenApiInfo { Title = "Main API", Version = "v1" });
            });
#endif

            return builder.Build();
        }

        public static void Configure(WebApplication app, IConfiguration config)
        {
            var serverAddressesFeature = app.Services.GetService<IServerAddressesFeature>();  //ServerFeatures.Get<IServerAddressesFeature>();
            if (serverAddressesFeature != null)
            {
                foreach (var address in serverAddressesFeature.Addresses)
                {
                    Log.Information($"Listening on: {address}");
                }
            }
            if (!app.Environment.IsDevelopment())
            {
                app.UseHsts();
            }
            else
            {
                app.UseDeveloperExceptionPage();
                app.UseExceptionHandler("/Error");
            }
            app.UseMiddleware<AuthFailureLoggingMiddleware>();
            app.UseSerilogRequestLogging();

            app.UseHttpsRedirection();

            app.UseStaticFiles();

#if DEBUG
            app.UseSwagger();
            app.UseSwaggerUI();
#endif

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
        }

        public static void MigrateDatabase(WebApplication app, IConfiguration config)
        {
            #region Database migration and seeding
            app.MigrateDatabase<MainDbContext>((context, services) =>
            {
                HostDataExtensions.SeedUserData(context, services, config);
            });
            #endregion
        }
    }
}
