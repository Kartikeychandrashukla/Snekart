namespace SnekartApi.Models
{
    public class Video
    {
        public Guid Id { get; set; }
        public byte[] Data { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "";
    }
}
