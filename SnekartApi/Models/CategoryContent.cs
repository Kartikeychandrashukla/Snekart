namespace SnekartApi.Models
{
    // Admin-written landing-page content for a category page (e.g. /festivals/karwa-chauth).
    // Stored as JSON in categories.content; null means the page uses auto-generated text.
    public class CategoryContent
    {
        public string? SeoTitle { get; set; }
        public string? Description { get; set; }
        public string? Heading { get; set; }
        public string? Intro { get; set; }
        public List<CategorySection> Sections { get; set; } = new();
        public List<CategoryFaq> Faqs { get; set; } = new();
    }

    public class CategorySection
    {
        public string Title { get; set; } = "";
        public string Body { get; set; } = "";
    }

    public class CategoryFaq
    {
        public string Q { get; set; } = "";
        public string A { get; set; } = "";
    }
}
