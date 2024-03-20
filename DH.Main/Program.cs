using DH.Main;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

#region Configuration - appsettings.json
var config = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
#if DEBUG
    .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
#endif
    .Build();
#endregion

#region Logging
Log.Logger = new LoggerConfiguration()
   .ReadFrom.Configuration(config)
   .Enrich.FromLogContext()   // Erlaubt der .BeginScope()-Methode um Kontextinformationen angereichert zu werden
   .CreateLogger();

Log.Debug("Application started at {DateTime} UTC", DateTime.UtcNow);
#endregion

try
{
    var app = Startup.ConfigureServices(builder, config);
    Startup.Configure(app, config);
    Startup.MigrateDatabase(app, config);

    Log.Debug("Application runs on https://localhost:7115");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "App terminated unexpectedly");
}
