using DH.Models.Main;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DH.DAL
{
    /// <summary>
    /// Extension methods for hosting data-related operations.
    /// </summary>
    public static class HostDataExtensions
    {
        /// <summary>
        /// Migrates the database and performs seeding if necessary.
        /// </summary>
        /// <typeparam name="TContext">The type of the database context.</typeparam>
        /// <param name="host">The host.</param>
        /// <param name="seeder">The seeder action.</param>
        /// <returns>The host.</returns>
        public static IHost MigrateDatabase<TContext>(this IHost host, Action<TContext, IServiceProvider> seeder) where TContext : DbContext
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<TContext>();

                context.Database.Migrate();
                seeder(context, services);
            }
            return host;
        }

        public static void SeedUserData(MainDbContext context, IServiceProvider serviceProvider, IConfiguration configuration)
        {
            if (context.Users.Any())
                return;

            var seededUsers = new List<UserSeedModel>();
            configuration.GetSection("Seed:Users")
                .Bind(seededUsers);

            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

            foreach (var seededUser in seededUsers)
            {
                var user = new User { 
                    UserName = seededUser.UserName, 
                    Email = seededUser.Email 
                };
                var identityResult = userManager.CreateAsync(user, seededUser.Password).Result;

                if (!identityResult.Succeeded)
                    throw new Exception("Failed to seed users");
            }
        }

        private class UserSeedModel
        {
            public string UserName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
