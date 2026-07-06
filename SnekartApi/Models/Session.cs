namespace SnekartApi.Models
{
    public class Session
    {
        public string Token { get; set; } = "";
        public int CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
