namespace SnekartApi.DTOs
{
    public class ProductRequest
    {
        public int Tier { get; set; }
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public List<string> Emotion { get; set; } = new();
        public decimal Price { get; set; }
        public decimal CostPrice { get; set; }
        public string Description { get; set; } = "";
        public List<string> Items { get; set; } = new();
        public string Image { get; set; } = "";
        public List<string> Images { get; set; } = new();
        public List<string> Specifications { get; set; } = new();
        public string SellerName { get; set; } = "Snekart";
        public decimal SellerRating { get; set; }
        public string? Badge { get; set; }
        public bool InStock { get; set; } = true;
    }
}
