namespace Dotnet1.Models
{
 public class TaskSession
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int TaskTypeId { get; set; }     // ✅ Add this line
    public Task TaskType { get; set; }      // ✅ Add this line

    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    // Optional helper property (not mapped)
    public double Duration { get; set; }
}

}