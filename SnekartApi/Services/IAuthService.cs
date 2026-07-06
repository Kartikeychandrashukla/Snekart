namespace SnekartApi.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(string name, string email, string password);
        Task<AuthResult> LoginAsync(string email, string password);
        Task LogoutAsync(string token);
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public string? Token { get; set; }
        public string? CustomerName { get; set; }
        public int? CustomerId { get; set; }
        public string? Level { get; set; }
    }
}
