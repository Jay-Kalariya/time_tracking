namespace Dotnet1.Models
{

public class UserToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}


}