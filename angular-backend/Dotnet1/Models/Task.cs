namespace Dotnet1.Models
{
    public class Task
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // ✅ Already safe
}
}