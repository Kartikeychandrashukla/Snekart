using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly SnekartDbContext _db;

        public OrderRepository(SnekartDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(Order order)
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
        }

        public async Task<Order?> GetByIdAsync(string id)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Order>> GetAllAsync()
        {
            return await _db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.PlacedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return false;
            order.Status = status;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Order>> GetMyOrdersAsync(int customerId)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.PlacedAt)
                .ToListAsync();
        }

        public async Task<Order?> GetByRazorpayOrderIdAsync(string razorpayOrderId)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.RazorpayOrderId == razorpayOrderId);
        }

        public async Task<bool> MarkPaidIfPendingAsync(string id, string razorpayPaymentId)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null || order.PaymentStatus == "Paid") return false;
            order.PaymentStatus = "Paid";
            order.RazorpayPaymentId = razorpayPaymentId;
            await _db.SaveChangesAsync();
            return true;
        }

    }
}
