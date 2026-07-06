using SnekartApi.Repositories;

namespace SnekartApi.Middleware
{
    public class SessionMiddleware(RequestDelegate next)
    {
        // IAuthRepository is scoped — inject via InvokeAsync, not constructor (middleware is singleton)
        public async Task InvokeAsync(HttpContext context, IAuthRepository authRepo)
        {
           var token = context.Request.Cookies["snekart_token"];

            if (!string.IsNullOrEmpty(token))
            {
                var session = await authRepo.GetSessionAsync(token);
                if (session != null)
                {
                    context.Items["CustomerId"] = session.CustomerId;
                    context.Items["CustomerName"] = session.Customer.Name;
                    context.Items["Level"] = session.Customer.Level;
                    context.Items["IsAdmin"] = session.Customer.Level == "admin";
                }
            }

            await next(context);
        }
    }
}
