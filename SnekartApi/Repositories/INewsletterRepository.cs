using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface INewsletterRepository
    {
        Task<bool> ExistsByEmailAsync(string email);
        Task AddAsync(NewsletterSubscriber subscriber);
        Task<List<NewsletterSubscriber>> GetAllSubscribersAsync();
        Task<NewsletterSubscriber?> GetByTokenAsync(Guid token);
        Task<bool> DeleteAsync(NewsletterSubscriber subscriber);
    }
}
