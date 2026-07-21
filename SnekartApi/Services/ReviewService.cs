using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _repo;

        public ReviewService(IReviewRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Review>> GetReviewsForProductAsync(int productId)
        {
            return await _repo.GetByProductIdAsync(productId);
        }

        public async Task<ReviewResult> CreateReviewAsync(int productId, ReviewRequest req)
        {
            if (req.Rating < 1 || req.Rating > 5)
                return new ReviewResult { Success = false, Message = "Rating must be between 1 and 5." };

            if (string.IsNullOrWhiteSpace(req.CustomerName) || string.IsNullOrWhiteSpace(req.Comment))
                return new ReviewResult { Success = false, Message = "Name and comment are required." };

            if (req.Images.Count > 4)
                return new ReviewResult { Success = false, Message = "You can attach up to 4 images." };

            var review = new Review
            {
                ProductId = productId,
                CustomerName = req.CustomerName,
                Rating = req.Rating,
                Comment = req.Comment,
                Images = req.Images,
                CreatedAt = DateTime.UtcNow,
            };

            await _repo.AddAsync(review);
            return new ReviewResult { Success = true, Message = "Review added successfully.", Review = review };
        }

        public async Task<bool> DeleteReviewAsync(int id)
{
    return await _repo.DeleteAsync(id);
}

    }
}
