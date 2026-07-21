namespace SnekartApi.DTOs
{
    public class BlogPostRequest
    {
        public string Title { get; set; } = "";
        public string Slug { get; set; } = "";
        public string Category { get; set; } = "";
        public List<string> Emotion { get; set; } = new();
        public string Excerpt { get; set; } = "";
        public string Content { get; set; } = "";
        public string Author { get; set; } = "";
        public string Image { get; set; } = "";

        public string Video {get; set;}="";
        public List<int> RelatedProductIds { get; set; } = new();
    }
}
