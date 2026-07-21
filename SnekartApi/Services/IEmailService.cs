using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface IEmailService
    {
        Task SendOrderPlacedEmailsAsync(Order order);

        Task SendNewPostNotificationAsync(BlogPost post, List<NewsletterSubscriber> subscribers);

    }
}
