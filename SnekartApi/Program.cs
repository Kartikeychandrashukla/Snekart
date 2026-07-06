using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;
using SnekartApi.Repositories;
using SnekartApi.Services;


var builder = WebApplication.CreateBuilder(args);

var pgHost = builder.Configuration["PGHOST"];
var connectionString = pgHost != null
    ? $"Host={pgHost};Port={builder.Configuration["PGPORT"]};Database={builder.Configuration["PGDATABASE"]};Username={builder.Configuration["PGUSER"]};Password={builder.Configuration["PGPASSWORD"]}"
    : builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<SnekartDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

var allowedOrigin = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins(allowedOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Throttles brute-force password guessing and email-enumeration sweeps against
// /api/auth/register and /api/auth/login (which now also gates admin access)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window      = TimeSpan.FromMinutes(1),
            QueueLimit  = 0,
        }));
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SnekartDbContext>();
    db.Database.Migrate();

    if (!db.Products.Any())
    {
        db.Products.AddRange(ProductSeedData.GetSeedProducts());
        db.SaveChanges();
    }

    if (!db.Customers.Any(c => c.Level == "admin"))
    {
        var adminPassword = builder.Configuration["AdminSeedPassword"] ?? "snekart2025";
        db.Customers.Add(new Customer
        {
            Name         = "Admin",
            Email        = "admin@snekart.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Level        = "admin",
            CreatedAt    = DateTime.UtcNow,
        });
        db.SaveChanges();
    }
}


app.UseCors("ReactApp");
app.UseRateLimiter();
app.UseMiddleware<SessionMiddleware>();
app.MapControllers();
app.Run();
