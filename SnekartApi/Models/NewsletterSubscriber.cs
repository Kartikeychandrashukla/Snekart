namespace SnekartApi.Models
{
    public class NewsletterSubscriber
    {
        public int Id {get; set;}

        public string Email {get; set;}="";

        public DateTime SubscribedAt {get; set; }

        public Guid UnsubscribeToken {get; set;}

}
}