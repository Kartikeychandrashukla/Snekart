namespace SnekartApi.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string CustomerName { get; set; } = "";
        public int Rating { get; set; }
        public string Comment { get; set; } = "";
        public List<string> Images { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}
