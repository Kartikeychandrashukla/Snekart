using SnekartApi.Models;

namespace SnekartApi.Data
{
    // Starter category values for the three product-tagging types. Admins can add, rename, or
    // remove entries from the admin dashboard after this initial seed.
    public static class CategorySeedData
    {
        public static List<Category> GetSeedCategories()
        {
            var now = DateTime.UtcNow;

            List<Category> Build(string type, params string[] names) =>
                names.Select(name => new Category
                {
                    Type      = type,
                    Name      = name,
                    Slug      = Slugify(name),
                    CreatedAt = now,
                }).ToList();

            var categories = new List<Category>();
            categories.AddRange(Build("Emotion", "Happy", "Loved", "Anxious", "Sad", "Calm", "Overwhelmed"));
            categories.AddRange(Build("Festival", "Diwali", "Christmas", "Raksha Bandhan", "Holi", "New Year"));
            categories.AddRange(Build("Occasion", "Wedding", "Birthday", "Anniversary", "Housewarming", "Graduation"));
            return categories;
        }

        private static string Slugify(string value) => value.Trim().ToLowerInvariant().Replace(" ", "-");
    }
}
