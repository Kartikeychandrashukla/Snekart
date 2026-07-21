using System.Security.Cryptography;
using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repo;
        private readonly IProductRepository _productRepo;
        private readonly IEmailService _emailService;
        private readonly IPaymentService _paymentService;

        // Mirrors Checkout.jsx's DELIVERY_CHARGE/FREE_ABOVE — keep both in sync
        private const decimal DeliveryCharge = 80m;
        private const decimal FreeDeliveryAbove = 2000m;

        public OrderService(IOrderRepository repo, IProductRepository productRepo, IEmailService emailService, IPaymentService paymentService)
        {
            _repo = repo;
            _productRepo = productRepo;
            _emailService = emailService;
            _paymentService = paymentService;
        }

        public async Task<OrderResult> PlaceOrderAsync(PlaceOrderRequest req, int? customerId)
        {
            if (req.Items.Count == 0)
                return new OrderResult { Success = false, Message = "Your cart is empty." };

            var productIds = new List<int>();
            foreach (var item in req.Items)
            {
                if (!int.TryParse(item.Id, out var productId) || item.Qty < 1)
                    return new OrderResult { Success = false, Message = "One or more items in your cart are no longer available." };
                productIds.Add(productId);
            }

            try
            {
                var products = await _productRepo.GetByIdsAsync(productIds.Distinct().ToList());
                var productMap = products.ToDictionary(p => p.Id);
                if (productMap.Count != productIds.Distinct().Count())
                    return new OrderResult { Success = false, Message = "One or more items in your cart are no longer available." };

                // Price always comes from the DB, never the client — name/image/tierLabel are
                // a harmless point-in-time snapshot of what the customer saw when they added to cart
                var orderItems = req.Items.Select(item => new OrderItem
                {
                    ProductId = item.Id,
                    Name      = item.Name,
                    TierLabel = item.TierLabel,
                    Image     = item.Image,
                    Price     = productMap[int.Parse(item.Id)].Price,
                    Qty       = item.Qty,
                }).ToList();

                var subtotal = orderItems.Sum(i => i.Price * i.Qty);
                var delivery = subtotal >= FreeDeliveryAbove ? 0 : DeliveryCharge;

                var isRazorpay = req.PaymentMethod == "Razorpay";

                var order = new Order
                {
                    Id            = GenerateOrderId(),
                    PlacedAt      = DateTime.UtcNow,
                    Total         = subtotal + delivery,
                    Status        = "Pending",
                    PaymentMethod = isRazorpay ? "Razorpay" : "COD",
                    PaymentStatus = isRazorpay ? "Pending" : "COD",
                    CustomerId    = customerId,
                    Name          = req.Address.Name,
                    Phone         = req.Address.Phone,
                    Email         = req.Address.Email.Trim().ToLower(),
                    AddressLine   = req.Address.Address,
                    City          = req.Address.City,
                    State         = req.Address.State,
                    Pincode       = req.Address.Pincode,
                    Items         = orderItems,
                };

                if (isRazorpay)
                    order.RazorpayOrderId = await _paymentService.CreateOrderAsync(order.Total, order.Id);

                await _repo.AddAsync(order);

                if (!isRazorpay)
                    await _emailService.SendOrderPlacedEmailsAsync(order);

                return new OrderResult
                {
                    Success = true,
                    Message = "Order placed successfully.",
                    Order = order,
                    RazorpayOrderId = order.RazorpayOrderId,
                    RazorpayKeyId = isRazorpay ? _paymentService.KeyId : null,
                };
            }
            catch (Exception)
            {
                return new OrderResult { Success = false, Message = "Failed to place order. Please try again." };
            }
        }

        public async Task<OrderResult> VerifyPaymentAsync(string orderId, string razorpayPaymentId, string razorpaySignature)
        {
            var order = await _repo.GetByIdAsync(orderId);
            if (order == null || string.IsNullOrEmpty(order.RazorpayOrderId))
                return new OrderResult { Success = false, NotFound = true, Message = "Order not found." };

            var isValid = _paymentService.VerifyPaymentSignature(order.RazorpayOrderId, razorpayPaymentId, razorpaySignature);
            if (!isValid)
                return new OrderResult { Success = false, Message = "Payment verification failed." };

            var justPaid = await _repo.MarkPaidIfPendingAsync(orderId, razorpayPaymentId);
            if (justPaid)
            {
                order.PaymentStatus = "Paid";
                order.RazorpayPaymentId = razorpayPaymentId;
                await _emailService.SendOrderPlacedEmailsAsync(order);
            }

            return new OrderResult { Success = true, Message = "Payment verified.", Order = order };
        }

        public async Task<bool> ConfirmPaymentFromWebhookAsync(string razorpayOrderId, string razorpayPaymentId)
        {
            var order = await _repo.GetByRazorpayOrderIdAsync(razorpayOrderId);
            if (order == null) return false;

            var justPaid = await _repo.MarkPaidIfPendingAsync(order.Id, razorpayPaymentId);
            if (justPaid)
            {
                order.PaymentStatus = "Paid";
                order.RazorpayPaymentId = razorpayPaymentId;
                await _emailService.SendOrderPlacedEmailsAsync(order);
            }

            return true;
        }

        public async Task<List<Order>> GetMyOrdersAsync(int customerId)
        {
            return await _repo.GetMyOrdersAsync(customerId);
        }

        public async Task<Order?> GetOrderAsync(string id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<OrderResult> UpdateStatusAsync(string id, string status)
        {
            try
            {
                var updated = await _repo.UpdateStatusAsync(id, status);
                if (!updated)
                    return new OrderResult { Success = false, NotFound = true, Message = "Order not found." };

                return new OrderResult { Success = true, Message = "Order status updated successfully." };
            }
            catch (Exception)
            {
                return new OrderResult { Success = false, Message = "Failed to update order status. Please try again." };
            }
        }

        // Unguessable order ID — the old "SNK-" + millisecond-timestamp scheme let anyone
        // enumerate nearby IDs and pull other customers' PII via the public GET /api/orders/{id}
        private static readonly char[] IdAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray();

        private static string GenerateOrderId()
        {
            var chars = new char[10];
            for (var i = 0; i < chars.Length; i++)
                chars[i] = IdAlphabet[RandomNumberGenerator.GetInt32(IdAlphabet.Length)];
            return "SNK-" + new string(chars);
        }
    }
}
