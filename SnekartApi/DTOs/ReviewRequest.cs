namespace SnekartApi.DTOs
{
    public class ReviewRequest
    {
        public string CustomerName { get; set; } = "";
        public int Rating { get; set; }
        public string Comment { get; set; } = "";
        public List<string> Images { get; set; } = new();
    }
}
