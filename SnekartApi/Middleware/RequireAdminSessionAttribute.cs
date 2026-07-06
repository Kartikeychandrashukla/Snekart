using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SnekartApi.Middleware
{
    // Decorate any action that requires the logged-in customer to have Level == "admin"
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequireAdminSessionAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.HttpContext.Items.ContainsKey("CustomerId"))
            {
                context.Result = new UnauthorizedObjectResult(new { error = "Login required." });
                return;
            }

            if (context.HttpContext.Items["IsAdmin"] is not true)
            {
                context.Result = new ObjectResult(new { error = "Admin access required." }) { StatusCode = 403 };
                return;
            }

            await next();
        }
    }
}
