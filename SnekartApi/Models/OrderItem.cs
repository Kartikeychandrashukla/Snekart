namespace SnekartApi.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = "";
        public string ProductId { get; set; } = "";
        public string Name { get; set; } = "";
        public string TierLabel { get; set; } = "";
        public string Image { get; set; } = "";
        public decimal Price { get; set; }
        public int Qty { get; set; }
    }
}
