using System.Data;
using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public OrderRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // Header insert + N item inserts must succeed or fail together — explicit transaction,
        // same idea as the Postgres version, just backed by Microsoft.Data.SqlClient's
        // SqlTransaction now. Passing the whole `order.Items` list straight to ExecuteAsync lets
        // Dapper execute usp_OrderItem_Add once per item in a single batch instead of a manual
        // C# loop with N separate awaits.
        public async Task AddAsync(Order order)
        {
            using var conn = _connectionFactory.CreateConnection();
            conn.Open();
            using var transaction = conn.BeginTransaction();

            await conn.ExecuteAsync(
                "usp_Order_AddHeader",
                new
                {
                    order.Id,
                    order.PlacedAt,
                    order.Total,
                    order.Status,
                    order.PaymentMethod,
                    order.PaymentStatus,
                    order.RazorpayOrderId,
                    order.RazorpayPaymentId,
                    order.CustomerId,
                    order.Name,
                    order.Phone,
                    order.Email,
                    order.AddressLine,
                    order.City,
                    order.State,
                    order.Pincode
                },
                transaction: transaction,
                commandType: CommandType.StoredProcedure);

            await conn.ExecuteAsync(
                "usp_OrderItem_Add",
                order.Items.Select(item => new
                {
                    OrderId = order.Id,
                    item.ProductId,
                    item.Name,
                    item.TierLabel,
                    item.Image,
                    item.Price,
                    item.Qty
                }),
                transaction: transaction,
                commandType: CommandType.StoredProcedure);

            transaction.Commit();
        }

        public async Task<Order?> GetByIdAsync(string id)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                "usp_Order_GetById",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { Id = id },
                splitOn: "Id",
                commandType: CommandType.StoredProcedure);

            return orderDict.Values.FirstOrDefault();
        }

        public async Task<List<Order>> GetAllAsync()
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                "usp_Order_GetAll",
                (order, item) => MapOrderItem(orderDict, order, item),
                splitOn: "Id",
                commandType: CommandType.StoredProcedure);

            return orderDict.Values.OrderByDescending(o => o.PlacedAt).ToList();
        }

        public async Task<List<Order>> GetMyOrdersAsync(int customerId)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                "usp_Order_GetByCustomer",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { CustomerId = customerId },
                splitOn: "Id",
                commandType: CommandType.StoredProcedure);

            return orderDict.Values.OrderByDescending(o => o.PlacedAt).ToList();
        }

        public async Task<Order?> GetByRazorpayOrderIdAsync(string razorpayOrderId)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                "usp_Order_GetByRazorpayOrderId",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { RazorpayOrderId = razorpayOrderId },
                splitOn: "Id",
                commandType: CommandType.StoredProcedure);

            return orderDict.Values.FirstOrDefault();
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Order_UpdateStatus",
                new { Id = id, Status = status },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> MarkPaidIfPendingAsync(string id, string razorpayPaymentId)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Order_MarkPaidIfPending",
                new { Id = id, RazorpayPaymentId = razorpayPaymentId },
                commandType: CommandType.StoredProcedure);
        }

        // Collapses repeated (Order, OrderItem) rows produced by the join back into one Order
        // per Id with a populated Items list. LEFT JOIN means a 0-item order still comes back
        // as one row with an all-default OrderItem (Id == 0) — skipped here.
        private static Order MapOrderItem(Dictionary<string, Order> orderDict, Order order, OrderItem item)
        {
            if (!orderDict.TryGetValue(order.Id, out var existing))
            {
                existing = order;
                orderDict[order.Id] = existing;
            }

            if (item.Id != 0)
            {
                existing.Items.Add(item);
            }

            return existing;
        }
    }
}
