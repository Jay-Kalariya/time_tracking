namespace Dotnet1.Models
{
   public class TaskSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int TaskId { get; set; }
    public Task Task { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}

}