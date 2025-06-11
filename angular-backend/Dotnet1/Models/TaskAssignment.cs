using Dotnet1.Models;


namespace Dotnet1.Models
{
 public class TaskAssignment
{
    public int Id { get; set; }

    public int TaskId { get; set; }
    public Task? Task { get; set; }  // <- Make it nullable

    public int UserId { get; set; }
    public User? User { get; set; }  // <- Also safe to make this nullable
}

}   