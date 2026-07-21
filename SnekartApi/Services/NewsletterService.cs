using System.Net.Mail;
using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class NewsletterService : INewsletterService
    {
        private readonly INewsletterRepository _repo;
        private readonly ILogger<NewsletterService> _logger;

        public NewsletterService(INewsletterRepository repo, ILogger<NewsletterService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task<NewsletterResult> SubscribeAsync(NewsletterSubscribeRequest req)
        {
            if (!IsValidEmail(req.Email))
                return new NewsletterResult { Success = false, Message = "Please enter a valid email address." };

            var email = req.Email.Trim().ToLowerInvariant();

            try
            {
                if (await _repo.ExistsByEmailAsync(email))
                    return new NewsletterResult { Success = true, Message = "You're already subscribed." };

                await _repo.AddAsync(new NewsletterSubscriber
                {
                    Email = email,
                    SubscribedAt = DateTime.UtcNow,
                    UnsubscribeToken = Guid.NewGuid(),
                });

                return new NewsletterResult { Success = true, Message = "Subscribed! You'll hear from us when we post." };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to save newsletter subscriber for {Email}", email);
                return new NewsletterResult { Success = false, Message = "Something went wrong. Please try again." };
            }
        }

        public async Task<bool> UnsubscribeAsync(Guid token)
        {
            var subscriber = await _repo.GetByTokenAsync(token);
            if (subscriber == null) return false;

            return await _repo.DeleteAsync(subscriber);
        }

      public async Task<List<NewsletterSubscriber>> GetAllSubscribersAsync()
{
    return await _repo.GetAllSubscribersAsync();
}


        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            try { _ = new MailAddress(email); return true; }
            catch (FormatException) { return false; }
        }
    }
}
