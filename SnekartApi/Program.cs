using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;
using SnekartApi.Repositories;
using SnekartApi.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<SnekartDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
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
    if (!db.Products.Any())
    {
        db.Products.AddRange(ProductSeedData.GetSeedProducts());
        db.SaveChanges();
    }

    if (!db.Customers.Any(c => c.Level == "admin"))
    {
        db.Customers.Add(new Customer
        {
            Name         = "Admin",
            Email        = "admin@snekart.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("snekart2025"),
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
