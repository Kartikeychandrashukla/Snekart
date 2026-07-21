using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class BlogPostRepository : IBlogPostRepository
    {
        private readonly SnekartDbContext _db;

        public BlogPostRepository(SnekartDbContext db)
        {
            _db = db;
        }

        public async Task<List<BlogPost>> GetAllAsync()
        {
            return await _db.BlogPosts
                .OrderByDescending(p => p.PublishedAt)
                .ToListAsync();
        }

        public async Task<BlogPost?> GetByIdAsync(int id)
        {
            return await _db.BlogPosts.FindAsync(id);
        }

        public async Task<BlogPost?> GetBySlugAsync(string slug)
        {
            return await _db.BlogPosts.FirstOrDefaultAsync(p => p.Slug == slug);
        }

        public async Task AddAsync(BlogPost post)
        {
            _db.BlogPosts.Add(post);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> UpdateAsync(int id, BlogPost post)
        {
            var existing = await _db.BlogPosts.FindAsync(id);
            if (existing == null) return false;

            existing.Title             = post.Title;
            existing.Slug              = post.Slug;
            existing.Category          = post.Category;
            existing.Emotion           = post.Emotion;
            existing.Excerpt           = post.Excerpt;
            existing.Content           = post.Content;
            existing.Author            = post.Author;
            existing.ReadTime          = post.ReadTime;
            existing.Image             = post.Image;
            existing.Video             = post.Video;
            existing.RelatedProductIds = post.RelatedProductIds;
            // PublishedAt is intentionally left untouched on edits — it marks
            // when the post first went live, not when it was last tweaked.

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.BlogPosts.FindAsync(id);
            if (existing == null) return false;

            _db.BlogPosts.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
