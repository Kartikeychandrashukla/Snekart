// One-off data migration: copies every row from the old SQL Server "Snekart" database
// (AWS RDS) into the new Postgres schema (Tables.sql + Procedures/ in SnekartApi/Database/).
// Run once, then discard — this project is deliberately NOT part of SnekartApi.csproj so
// Microsoft.Data.SqlClient never creeps back into the production API's dependencies.
//
// Usage:
//   SOURCE_CONNECTION="Server=...;Database=Snekart;User Id=...;Password=...;TrustServerCertificate=True" \
//   TARGET_CONNECTION="Host=localhost;Port=5433;Database=snekart;Username=postgres;Password=devpassword" \
//   dotnet run

using Microsoft.Data.SqlClient;
using Npgsql;

var sourceConnStr = Environment.GetEnvironmentVariable("SOURCE_CONNECTION")
    ?? throw new InvalidOperationException("SOURCE_CONNECTION env var not set.");
var targetConnStr = Environment.GetEnvironmentVariable("TARGET_CONNECTION")
    ?? throw new InvalidOperationException("TARGET_CONNECTION env var not set.");

using var source = new SqlConnection(sourceConnStr);
using var target = new NpgsqlConnection(targetConnStr);
await source.OpenAsync();
await target.OpenAsync();

Console.WriteLine("Connected to both databases. Migrating in FK-safe order...\n");

// Order matters: a table with a FOREIGN KEY is copied after the table it points to.
await CopyCategories(source, target);
await CopyCustomers(source, target);
await CopyProducts(source, target);
await CopyProductImages(source, target);
await CopyBlogPosts(source, target);
await CopyReviews(source, target);
await CopyVideos(source, target);
await CopyNewsletterSubscribers(source, target);
await CopySessions(source, target);
await CopyOrders(source, target);
await CopyOrderItems(source, target);

Console.WriteLine("\nDone. Verifying row counts...\n");
await VerifyCounts(source, target);

static DateTime Utc(DateTime dt) => DateTime.SpecifyKind(dt, DateTimeKind.Utc);

static async Task<int> RunCopy(
    SqlConnection source, NpgsqlConnection target,
    string label, string selectSql, string insertSql,
    Func<SqlDataReader, NpgsqlCommand, Task> bind,
    string? identityTable = null, string? identityColumn = null)
{
    using var selectCmd = new SqlCommand(selectSql, source);
    using var reader = await selectCmd.ExecuteReaderAsync();

    var count = 0;
    while (await reader.ReadAsync())
    {
        using var insertCmd = new NpgsqlCommand(insertSql, target);
        await bind(reader, insertCmd);
        await insertCmd.ExecuteNonQueryAsync();
        count++;
    }

    if (identityTable != null && identityColumn != null && count > 0)
    {
        using var resetCmd = new NpgsqlCommand(
            $"SELECT setval(pg_get_serial_sequence('{identityTable}', '{identityColumn}'), " +
            $"(SELECT COALESCE(MAX({identityColumn}), 1) FROM {identityTable}))", target);
        await resetCmd.ExecuteNonQueryAsync();
    }

    Console.WriteLine($"{label}: copied {count} row(s)");
    return count;
}

static Task CopyCategories(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "categories",
    "SELECT Id, Type, Name, Slug, CreatedAt FROM Categories",
    "INSERT INTO categories (id, type, name, slug, createdat) OVERRIDING SYSTEM VALUE VALUES (@id, @type, @name, @slug, @createdat)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("type", r.GetString(1));
        cmd.Parameters.AddWithValue("name", r.GetString(2));
        cmd.Parameters.AddWithValue("slug", r.GetString(3));
        cmd.Parameters.AddWithValue("createdat", Utc(r.GetDateTime(4)));
        await Task.CompletedTask;
    },
    "categories", "id");

static Task CopyCustomers(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "customers",
    "SELECT Id, Name, Email, PasswordHash, Level, CreatedAt FROM Customers",
    "INSERT INTO customers (id, name, email, passwordhash, level, createdat) OVERRIDING SYSTEM VALUE VALUES (@id, @name, @email, @passwordhash, @level, @createdat)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("name", r.GetString(1));
        cmd.Parameters.AddWithValue("email", r.GetString(2));
        cmd.Parameters.AddWithValue("passwordhash", r.GetString(3));
        cmd.Parameters.AddWithValue("level", r.GetString(4));
        cmd.Parameters.AddWithValue("createdat", Utc(r.GetDateTime(5)));
        await Task.CompletedTask;
    },
    "customers", "id");

static Task CopyProducts(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "products",
    @"SELECT Id, Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice,
             Description, Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock
      FROM Products",
    @"INSERT INTO products (id, tier, tierlabel, name, slug, emotion, festival, occasion, price, costprice,
                             description, items, image, images, specifications, sellername, sellerrating, badge, instock)
      OVERRIDING SYSTEM VALUE
      VALUES (@id, @tier, @tierlabel, @name, @slug, @emotion, @festival, @occasion, @price, @costprice,
              @description, @items, @image, @images, @specifications, @sellername, @sellerrating, @badge, @instock)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("tier", r.GetInt32(1));
        cmd.Parameters.AddWithValue("tierlabel", r.GetString(2));
        cmd.Parameters.AddWithValue("name", r.GetString(3));
        cmd.Parameters.AddWithValue("slug", r.GetString(4));
        cmd.Parameters.AddWithValue("emotion", r.GetString(5));
        cmd.Parameters.AddWithValue("festival", r.GetString(6));
        cmd.Parameters.AddWithValue("occasion", r.GetString(7));
        cmd.Parameters.AddWithValue("price", r.GetDecimal(8));
        cmd.Parameters.AddWithValue("costprice", r.GetDecimal(9));
        cmd.Parameters.AddWithValue("description", r.GetString(10));
        cmd.Parameters.AddWithValue("items", r.GetString(11));
        cmd.Parameters.AddWithValue("image", r.GetString(12));
        cmd.Parameters.AddWithValue("images", r.GetString(13));
        cmd.Parameters.AddWithValue("specifications", r.GetString(14));
        cmd.Parameters.AddWithValue("sellername", r.GetString(15));
        cmd.Parameters.AddWithValue("sellerrating", r.GetDecimal(16));
        cmd.Parameters.AddWithValue("badge", r.IsDBNull(17) ? DBNull.Value : r.GetString(17));
        cmd.Parameters.AddWithValue("instock", r.GetBoolean(18));
        await Task.CompletedTask;
    },
    "products", "id");

static Task CopyProductImages(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "productimages",
    "SELECT Id, Data, ContentType FROM ProductImages",
    "INSERT INTO productimages (id, data, contenttype) VALUES (@id, @data, @contenttype)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetGuid(0));
        cmd.Parameters.AddWithValue("data", (byte[])r["Data"]);
        cmd.Parameters.AddWithValue("contenttype", r.GetString(2));
        await Task.CompletedTask;
    });

static Task CopyBlogPosts(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "blogposts",
    @"SELECT Id, Title, Slug, Category, Emotion, Excerpt, Content, Author, ReadTime, Image, Video, PublishedAt, RelatedProductIds
      FROM BlogPosts",
    @"INSERT INTO blogposts (id, title, slug, category, emotion, excerpt, content, author, readtime, image, video, publishedat, relatedproductids)
      OVERRIDING SYSTEM VALUE
      VALUES (@id, @title, @slug, @category, @emotion, @excerpt, @content, @author, @readtime, @image, @video, @publishedat, @relatedproductids)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("title", r.GetString(1));
        cmd.Parameters.AddWithValue("slug", r.GetString(2));
        cmd.Parameters.AddWithValue("category", r.GetString(3));
        cmd.Parameters.AddWithValue("emotion", r.GetString(4));
        cmd.Parameters.AddWithValue("excerpt", r.GetString(5));
        cmd.Parameters.AddWithValue("content", r.GetString(6));
        cmd.Parameters.AddWithValue("author", r.GetString(7));
        cmd.Parameters.AddWithValue("readtime", r.GetString(8));
        cmd.Parameters.AddWithValue("image", r.GetString(9));
        cmd.Parameters.AddWithValue("video", r.IsDBNull(10) ? DBNull.Value : r.GetString(10));
        cmd.Parameters.AddWithValue("publishedat", Utc(r.GetDateTime(11)));
        cmd.Parameters.AddWithValue("relatedproductids", r.GetString(12));
        await Task.CompletedTask;
    },
    "blogposts", "id");

static Task CopyReviews(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "reviews",
    "SELECT Id, ProductId, CustomerName, Rating, Comment, Images, CreatedAt FROM Reviews",
    @"INSERT INTO reviews (id, productid, customername, rating, comment, images, createdat)
      OVERRIDING SYSTEM VALUE
      VALUES (@id, @productid, @customername, @rating, @comment, @images, @createdat)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("productid", r.GetInt32(1));
        cmd.Parameters.AddWithValue("customername", r.GetString(2));
        cmd.Parameters.AddWithValue("rating", r.GetInt32(3));
        cmd.Parameters.AddWithValue("comment", r.GetString(4));
        cmd.Parameters.AddWithValue("images", r.GetString(5));
        cmd.Parameters.AddWithValue("createdat", Utc(r.GetDateTime(6)));
        await Task.CompletedTask;
    },
    "reviews", "id");

static Task CopyVideos(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "videos",
    "SELECT Id, Data, ContentType FROM Videos",
    "INSERT INTO videos (id, data, contenttype) VALUES (@id, @data, @contenttype)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetGuid(0));
        cmd.Parameters.AddWithValue("data", (byte[])r["Data"]);
        cmd.Parameters.AddWithValue("contenttype", r.GetString(2));
        await Task.CompletedTask;
    });

static Task CopyNewsletterSubscribers(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "newslettersubscribers",
    "SELECT Id, Email, SubscribedAt, UnsubscribeToken FROM NewsletterSubscribers",
    @"INSERT INTO newslettersubscribers (id, email, subscribedat, unsubscribetoken)
      OVERRIDING SYSTEM VALUE
      VALUES (@id, @email, @subscribedat, @unsubscribetoken)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("email", r.GetString(1));
        cmd.Parameters.AddWithValue("subscribedat", Utc(r.GetDateTime(2)));
        cmd.Parameters.AddWithValue("unsubscribetoken", r.GetGuid(3));
        await Task.CompletedTask;
    },
    "newslettersubscribers", "id");

static Task CopySessions(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "sessions",
    "SELECT Token, CustomerId, ExpiresAt FROM Sessions",
    "INSERT INTO sessions (token, customerid, expiresat) VALUES (@token, @customerid, @expiresat)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("token", r.GetString(0));
        cmd.Parameters.AddWithValue("customerid", r.GetInt32(1));
        cmd.Parameters.AddWithValue("expiresat", Utc(r.GetDateTime(2)));
        await Task.CompletedTask;
    });

static Task CopyOrders(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "orders",
    @"SELECT Id, PlacedAt, Total, Status, PaymentMethod, PaymentStatus, RazorpayOrderId, RazorpayPaymentId,
             CustomerId, Name, Phone, Email, AddressLine, City, State, Pincode
      FROM Orders",
    @"INSERT INTO orders (id, placedat, total, status, paymentmethod, paymentstatus, razorpayorderid, razorpaypaymentid,
                           customerid, name, phone, email, addressline, city, state, pincode)
      VALUES (@id, @placedat, @total, @status, @paymentmethod, @paymentstatus, @razorpayorderid, @razorpaypaymentid,
              @customerid, @name, @phone, @email, @addressline, @city, @state, @pincode)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetString(0));
        cmd.Parameters.AddWithValue("placedat", Utc(r.GetDateTime(1)));
        cmd.Parameters.AddWithValue("total", r.GetDecimal(2));
        cmd.Parameters.AddWithValue("status", r.GetString(3));
        cmd.Parameters.AddWithValue("paymentmethod", r.GetString(4));
        cmd.Parameters.AddWithValue("paymentstatus", r.GetString(5));
        cmd.Parameters.AddWithValue("razorpayorderid", r.IsDBNull(6) ? DBNull.Value : r.GetString(6));
        cmd.Parameters.AddWithValue("razorpaypaymentid", r.IsDBNull(7) ? DBNull.Value : r.GetString(7));
        cmd.Parameters.AddWithValue("customerid", r.IsDBNull(8) ? DBNull.Value : r.GetInt32(8));
        cmd.Parameters.AddWithValue("name", r.GetString(9));
        cmd.Parameters.AddWithValue("phone", r.GetString(10));
        cmd.Parameters.AddWithValue("email", r.GetString(11));
        cmd.Parameters.AddWithValue("addressline", r.GetString(12));
        cmd.Parameters.AddWithValue("city", r.GetString(13));
        cmd.Parameters.AddWithValue("state", r.GetString(14));
        cmd.Parameters.AddWithValue("pincode", r.GetString(15));
        await Task.CompletedTask;
    });

static Task CopyOrderItems(SqlConnection source, NpgsqlConnection target) => RunCopy(
    source, target, "orderitems",
    "SELECT Id, OrderId, ProductId, Name, TierLabel, Image, Price, Qty FROM OrderItems",
    @"INSERT INTO orderitems (id, orderid, productid, name, tierlabel, image, price, qty)
      OVERRIDING SYSTEM VALUE
      VALUES (@id, @orderid, @productid, @name, @tierlabel, @image, @price, @qty)",
    async (r, cmd) =>
    {
        cmd.Parameters.AddWithValue("id", r.GetInt32(0));
        cmd.Parameters.AddWithValue("orderid", r.GetString(1));
        cmd.Parameters.AddWithValue("productid", r.GetString(2));
        cmd.Parameters.AddWithValue("name", r.GetString(3));
        cmd.Parameters.AddWithValue("tierlabel", r.GetString(4));
        cmd.Parameters.AddWithValue("image", r.GetString(5));
        cmd.Parameters.AddWithValue("price", r.GetDecimal(6));
        cmd.Parameters.AddWithValue("qty", r.GetInt32(7));
        await Task.CompletedTask;
    },
    "orderitems", "id");

static async Task VerifyCounts(SqlConnection source, NpgsqlConnection target)
{
    var tables = new[]
    {
        "Customers", "Sessions", "Orders", "OrderItems", "Products",
        "ProductImages", "BlogPosts", "Reviews", "Videos", "NewsletterSubscribers", "Categories"
    };

    foreach (var t in tables)
    {
        using var srcCmd = new SqlCommand($"SELECT COUNT(*) FROM {t}", source);
        var srcCount = (int)(await srcCmd.ExecuteScalarAsync())!;

        using var tgtCmd = new NpgsqlCommand($"SELECT COUNT(*) FROM {t.ToLower()}", target);
        var tgtCount = (long)(await tgtCmd.ExecuteScalarAsync())!;

        var match = srcCount == tgtCount ? "OK" : "MISMATCH";
        Console.WriteLine($"{t,-22} source={srcCount,-6} target={tgtCount,-6} {match}");
    }
}
