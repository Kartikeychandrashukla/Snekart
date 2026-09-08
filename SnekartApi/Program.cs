using System.Threading.RateLimiting;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;
using SnekartApi.Repositories;
using SnekartApi.Services;


var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5084";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Dapper has no DbContext and SQL Server has no built-in migration runner the app can call —
// repositories ask this factory for a plain ADO.NET connection per call, and the schema/SPs
// are created out-of-band by running your T-SQL scripts against the database directly.
builder.Services.AddScoped<IDbConnectionFactory>(_ => new SqlConnectionFactory(connectionString!));
Dapper.SqlMapper.AddTypeHandler(new StringListTypeHandler());
Dapper.SqlMapper.AddTypeHandler(new IntListTypeHandler());

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
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddHttpClient<IEmailService, EmailService>(client =>
    client.BaseAddress = new Uri("https://api.resend.com/"));
builder.Services.AddHttpClient<IPaymentService, PaymentService>(client =>
    client.BaseAddress = new Uri("https://api.razorpay.com/v1/"));

var allowedOrigins = (builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins(allowedOrigins)
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

// Schema + stored procedures are expected to already exist (created via your own T-SQL
// scripts) — there's no EF-style db.Database.Migrate() equivalent here.
using (var scope = app.Services.CreateScope())
{
    var authRepository = scope.ServiceProvider.GetRequiredService<IAuthRepository>();
    var categoryRepository = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();

    // Categories are structural taxonomy, not admin-authored content — seeding them if the
    // Emotion type is empty is safe even after this has run once, since an admin emptying
    // every category is a different (and much rarer) situation than "deleted some products".
    var existingCategories = await categoryRepository.GetByTypeAsync("Emotion");
    if (existingCategories.Count == 0)
    {
        foreach (var category in CategorySeedData.GetSeedCategories())
        {
            await categoryRepository.AddAsync(category);
        }
    }

    // Products and blog posts are NOT re-seeded here on purpose — this used to run "if the
    // table is empty, refill it with demo data" on every startup, which meant deleting every
    // product/post through the admin dashboard never actually stuck: the next restart saw an
    // empty table and silently put the demo catalog right back. Now that products/posts are
    // managed for real, an empty table just means empty — run Data/ProductSeedData.cs and
    // Data/BlogSeedData.cs manually (e.g. via a one-off script) if you ever want the demo
    // catalog back for testing.

    // Original EF check was "any customer at admin level" — narrowed here to this specific
    // seed email since the Dapper repositories don't expose a generic "any admin" lookup.
    var existingAdmin = await authRepository.GetByEmailAsync("admin@snekart.in");
    if (existingAdmin == null)
    {
        var adminPassword = builder.Configuration["AdminSeedPassword"] ?? "snekart2025";
        await authRepository.CreateCustomerAsync(new Customer
        {
            Name         = "Admin",
            Email        = "admin@snekart.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Level        = "admin",
            CreatedAt    = DateTime.UtcNow,
        });
    }
}


app.UseCors("ReactApp");
app.UseRateLimiter();
app.UseMiddleware<SessionMiddleware>();
app.MapControllers();
app.Run();
