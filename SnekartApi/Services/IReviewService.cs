using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface IReviewService
    {
        Task<List<Review>> GetReviewsForProductAsync(int productId);
        Task<ReviewResult> CreateReviewAsync(int productId, ReviewRequest req);

          Task<bool> DeleteReviewAsync(int id);
    }



    public class ReviewResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public Review? Review { get; set; }
    }
}
