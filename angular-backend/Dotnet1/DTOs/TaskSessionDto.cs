namespace Dotnet1.DTOs
{
public class TaskSessionDto
{
    public int Id { get; set; }             // ✅ Add this line
    public int TaskId { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double Duration { get; set; }
}

}
