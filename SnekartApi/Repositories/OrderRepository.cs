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

        // usp_order_getbyid/getall/getbycustomer/getbyrazorpayorderid all return the order-item
        // columns under unique item* names (Postgres functions can't return two columns both
        // named "id"/"name" the way a plain SQL Server SELECT could). This SELECT re-aliases
        // them back to Id/OrderId/Name/etc. — that's legal for an ad-hoc SELECT's output even
        // though it isn't for a function's RETURNS TABLE — which is what Dapper's
        // QueryAsync<Order, OrderItem, Order> multi-mapping (splitOn: "Id") expects to see.
        private const string OrderItemColumns =
            "itemid AS id, itemorderid AS orderid, itemproductid AS productid, " +
            "itemname AS name, itemtierlabel AS tierlabel, itemimage AS image, " +
            "itemprice AS price, itemqty AS qty";

        // Header insert + N item inserts must succeed or fail together — explicit transaction,
        // same idea as the SQL Server version, just backed by Npgsql's NpgsqlTransaction now.
        // Passing the whole `order.Items` list straight to ExecuteAsync lets Dapper execute
        // usp_orderitem_add once per item in a single batch instead of a manual C# loop with
        // N separate awaits.
        public async Task AddAsync(Order order)
        {
            using var conn = _connectionFactory.CreateConnection();
            conn.Open();
            using var transaction = conn.BeginTransaction();

            await conn.ExecuteAsync(
                "SELECT usp_order_addheader(@Id, @PlacedAt, @Total, @Status, @PaymentMethod, @PaymentStatus, @RazorpayOrderId, @RazorpayPaymentId, @CustomerId, @Name, @Phone, @Email, @AddressLine, @City, @State, @Pincode)",
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
                transaction: transaction);

            await conn.ExecuteAsync(
                "SELECT usp_orderitem_add(@OrderId, @ProductId, @Name, @TierLabel, @Image, @Price, @Qty)",
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
                transaction: transaction);

            transaction.Commit();
        }

        public async Task<Order?> GetByIdAsync(string id)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                $"SELECT id, placedat, total, status, paymentmethod, paymentstatus, razorpayorderid, razorpaypaymentid, customerid, name, phone, email, addressline, city, state, pincode, {OrderItemColumns} FROM usp_order_getbyid(@Id)",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { Id = id },
                splitOn: "Id");

            return orderDict.Values.FirstOrDefault();
        }

        public async Task<List<Order>> GetAllAsync()
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                $"SELECT id, placedat, total, status, paymentmethod, paymentstatus, razorpayorderid, razorpaypaymentid, customerid, name, phone, email, addressline, city, state, pincode, {OrderItemColumns} FROM usp_order_getall()",
                (order, item) => MapOrderItem(orderDict, order, item),
                splitOn: "Id");

            return orderDict.Values.OrderByDescending(o => o.PlacedAt).ToList();
        }

        public async Task<List<Order>> GetMyOrdersAsync(int customerId)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                $"SELECT id, placedat, total, status, paymentmethod, paymentstatus, razorpayorderid, razorpaypaymentid, customerid, name, phone, email, addressline, city, state, pincode, {OrderItemColumns} FROM usp_order_getbycustomer(@CustomerId)",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { CustomerId = customerId },
                splitOn: "Id");

            return orderDict.Values.OrderByDescending(o => o.PlacedAt).ToList();
        }

        public async Task<Order?> GetByRazorpayOrderIdAsync(string razorpayOrderId)
        {
            using var conn = _connectionFactory.CreateConnection();
            var orderDict = new Dictionary<string, Order>();

            await conn.QueryAsync<Order, OrderItem, Order>(
                $"SELECT id, placedat, total, status, paymentmethod, paymentstatus, razorpayorderid, razorpaypaymentid, customerid, name, phone, email, addressline, city, state, pincode, {OrderItemColumns} FROM usp_order_getbyrazorpayorderid(@RazorpayOrderId)",
                (order, item) => MapOrderItem(orderDict, order, item),
                new { RazorpayOrderId = razorpayOrderId },
                splitOn: "Id");

            return orderDict.Values.FirstOrDefault();
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_order_updatestatus(@Id, @Status)",
                new { Id = id, Status = status });
        }

        public async Task<bool> MarkPaidIfPendingAsync(string id, string razorpayPaymentId)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_order_markpaidifpending(@Id, @RazorpayPaymentId)",
                new { Id = id, RazorpayPaymentId = razorpayPaymentId });
        }

        // Collapses repeated (Order, OrderItem) rows produced by the join back into one Order
        // per Id with a populated Items list. LEFT JOIN means a 0-item order still comes back
        // as one row with every item column NULL — Dapper's multi-mapping hands that back as a
        // null OrderItem (not an all-default instance with Id == 0), so check for null first.
        private static Order MapOrderItem(Dictionary<string, Order> orderDict, Order order, OrderItem? item)
        {
            if (!orderDict.TryGetValue(order.Id, out var existing))
            {
                existing = order;
                orderDict[order.Id] = existing;
            }

            if (item != null && item.Id != 0)
            {
                existing.Items.Add(item);
            }

            return existing;
        }
    }
}
