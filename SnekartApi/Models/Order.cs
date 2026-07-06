using System.Text.Json.Serialization;

namespace SnekartApi.Models
{
    public class Order
    {
        public string Id { get; set; } = "";
        public DateTime PlacedAt { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "Pending";

        public int? CustomerId { get; set; }

        // Never serialize this navigation property — EF Core's relationship fixup
        // populates it automatically whenever the Customer entity happens to already
        // be tracked in the same request's DbContext (e.g. SessionMiddleware resolving
        // the caller's own session), which was leaking full Customer records —
        // including PasswordHash — into every order-returning API response.
        [JsonIgnore]
        public Customer? Customer { get; set; }

        public string Name { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string AddressLine { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string Pincode { get; set; } = "";

        public List<OrderItem> Items { get; set; } = new();
    }
}
