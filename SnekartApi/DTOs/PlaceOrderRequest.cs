namespace SnekartApi.DTOs
{
    // Note: no Total here — price and total are always derived server-side from
    // the Products table in OrderService, never trusted from the client.
    public class PlaceOrderRequest
    {
        public List<OrderItemDto> Items { get; set; } = new();
        public AddressDto Address { get; set; } = new();
        // "COD" or "Razorpay"
        public string PaymentMethod { get; set; } = "COD";
    }

    public class VerifyPaymentRequest
    {
        public string RazorpayOrderId { get; set; } = "";
        public string RazorpayPaymentId { get; set; } = "";
        public string RazorpaySignature { get; set; } = "";
    }

    public class OrderItemDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string TierLabel { get; set; } = "";
        public string Image { get; set; } = "";
        public int Qty { get; set; }
    }

    public class AddressDto
    {
        public string Name { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Address { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string Pincode { get; set; } = "";
    }
}
