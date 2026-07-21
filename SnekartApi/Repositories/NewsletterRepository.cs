using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class NewsletterRepository : INewsletterRepository
    {
        private readonly SnekartDbContext _db;

        public NewsletterRepository(SnekartDbContext db)
        {
            _db = db;
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _db.NewsletterSubscribers.AnyAsync(s => s.Email == email);
        }

        public async Task AddAsync(NewsletterSubscriber subscriber)
        {
            _db.NewsletterSubscribers.Add(subscriber);
            await _db.SaveChangesAsync();
        }

       public async Task<List<NewsletterSubscriber>> GetAllSubscribersAsync()
{
    return await _db.NewsletterSubscribers.ToListAsync();
}


        public async Task<NewsletterSubscriber?> GetByTokenAsync(Guid token)
        {
            return await _db.NewsletterSubscribers
                .FirstOrDefaultAsync(s => s.UnsubscribeToken == token);
        }

        public async Task<bool> DeleteAsync(NewsletterSubscriber subscriber)
        {
            _db.NewsletterSubscribers.Remove(subscriber);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
