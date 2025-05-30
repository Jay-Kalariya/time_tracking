using System.Security.Claims;

namespace Dotnet1.Extensions
{
public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }
}

}