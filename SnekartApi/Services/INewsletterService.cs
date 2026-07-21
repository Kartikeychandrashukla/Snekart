using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface INewsletterService
    {
        Task<NewsletterResult> SubscribeAsync(NewsletterSubscribeRequest req);
        Task<bool> UnsubscribeAsync(Guid token);
       Task<List<NewsletterSubscriber>> GetAllSubscribersAsync();   // was: GetAllSubscriberEmailsAsync

    }

    public class NewsletterResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
    }
}
