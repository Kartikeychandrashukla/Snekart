namespace SnekartApi.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string Level { get; set; } = "customer";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Order> Orders { get; set; } = new();
    }
}
