using Microsoft.EntityFrameworkCore;
using SnekartApi.Models;

namespace SnekartApi.Data
{
    public class SnekartDbContext : DbContext
    {
        public SnekartDbContext(DbContextOptions<SnekartDbContext> options) : base(options) { }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Product> Products { get; set; }

        public DbSet<ProductImage> ProductImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .Property(o => o.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(i => i.Price)
                .HasPrecision(18, 2);

            // Customer → Orders
            modelBuilder.Entity<Customer>()
                .HasMany(c => c.Orders)
                .WithOne(o => o.Customer)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            // Customer email must be unique
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Existing rows (created before Level existed) become "customer", not blank
            modelBuilder.Entity<Customer>()
                .Property(c => c.Level)
                .HasDefaultValue("customer");

            // Session token is the primary key
            modelBuilder.Entity<Session>()
                .HasKey(s => s.Token);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Customer)
                .WithMany()
                .HasForeignKey(s => s.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product slug must be unique
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Product>()
                .Property(p => p.CostPrice)
                .HasPrecision(18, 2);
        }
    }
}
