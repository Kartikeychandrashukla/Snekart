namespace SnekartApi.Services
{
    public interface IPaymentService
    {
        Task<string> CreateOrderAsync(decimal amount, string receipt);
        bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature);
        bool VerifyWebhookSignature(string rawBody, string signatureHeader);
        string? KeyId { get; }
    }
}
