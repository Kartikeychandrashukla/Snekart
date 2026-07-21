using System.Text.RegularExpressions;
using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class BlogPostService : IBlogPostService
    {
        private readonly IBlogPostRepository _repo;

        public BlogPostService(IBlogPostRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<BlogPost>> GetAllPostsAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<BlogPost?> GetPostBySlugAsync(string slug)
        {
            return await _repo.GetBySlugAsync(slug);
        }

         public async Task<BlogPostResult> CreatePostAsync(BlogPostRequest req)
    {
        try
        {
            var post = MapToPost(req);
            post.PublishedAt = DateTime.UtcNow;
            await _repo.AddAsync(post);
            return new BlogPostResult { Success = true, Message = "Post published successfully.", Post = post };
        }
        catch (Exception)
        {
            return new BlogPostResult { Success = false, Message = "Failed to save post. Please try again." };
        }
    }

        public async Task<BlogPostResult> UpdatePostAsync(int id, BlogPostRequest req)
        {
            try
            {
                var post = MapToPost(req);
                var updated = await _repo.UpdateAsync(id, post);
                if (!updated)
                    return new BlogPostResult { Success = false, NotFound = true, Message = "Post not found." };

                return new BlogPostResult { Success = true, Message = "Post updated successfully." };
            }
            catch (Exception)
            {
                return new BlogPostResult { Success = false, Message = "Failed to update post. Please try again." };
            }
        }

        public async Task<BlogPostResult> DeletePostAsync(int id)
        {
            try
            {
                var deleted = await _repo.DeleteAsync(id);
                if (!deleted)
                    return new BlogPostResult { Success = false, NotFound = true, Message = "Post not found." };

                return new BlogPostResult { Success = true, Message = "Post deleted successfully." };
            }
            catch (Exception)
            {
                return new BlogPostResult { Success = false, Message = "Failed to delete post. Please try again." };
            }
        }

        private static BlogPost MapToPost(BlogPostRequest req)
        {
            return new BlogPost
            {
                Title             = req.Title,
                Slug              = string.IsNullOrWhiteSpace(req.Slug) ? Slugify(req.Title) : Slugify(req.Slug),
                Category          = req.Category,
                Emotion           = req.Emotion,
                Excerpt           = req.Excerpt,
                Content           = req.Content,
                Author            = string.IsNullOrWhiteSpace(req.Author) ? "Snekart Team" : req.Author,
                ReadTime          = EstimateReadTime(req.Content),
                Image             = req.Image,
                Video            = req.Video,
                RelatedProductIds = req.RelatedProductIds,
            };
        }

        // ~200 words/minute average adult reading speed
        private static string EstimateReadTime(string content)
        {
            var wordCount = content.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
            var minutes = Math.Max(1, (int)Math.Ceiling(wordCount / 200.0));
            return $"{minutes} min read";
        }

        private static string Slugify(string value)
        {
            var slug = value.Trim().ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');
            return slug;
        }
    }
}
