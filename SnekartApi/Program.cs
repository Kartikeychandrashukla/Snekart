using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;
using SnekartApi.Repositories;
using SnekartApi.Services;


var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5084";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");


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
builder.Services.AddScoped<IBlogPostRepository, BlogPostRepository>();
builder.Services.AddScoped<IBlogPostService, BlogPostService>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<INewsletterRepository,NewsletterRepository>();
builder.Services.AddScoped<INewsletterService,NewsletterService>();
builder.Services.AddHttpClient<IEmailService, EmailService>(client =>
    client.BaseAddress = new Uri("https://api.resend.com/"));
builder.Services.AddHttpClient<IPaymentService, PaymentService>(client =>
    client.BaseAddress = new Uri("https://api.razorpay.com/v1/"));

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

    if (!db.BlogPosts.Any())
    {
        var productIdBySlug = db.Products.ToDictionary(p => p.Slug, p => p.Id);
        db.BlogPosts.AddRange(BlogSeedData.GetSeedPosts(productIdBySlug));
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
