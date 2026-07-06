using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SnekartApi.Middleware
{
    // Decorate any action that requires a valid session token
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequireSessionAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.HttpContext.Items.ContainsKey("CustomerId"))
            {
                context.Result = new UnauthorizedObjectResult(new { error = "Login required." });
                return;
            }
            await next();
        }
    }
}
