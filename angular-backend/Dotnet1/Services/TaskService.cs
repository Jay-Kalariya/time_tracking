using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;

namespace Dotnet1.Services;

public class TaskService
{
    private readonly TimeTrackingContext _dbContext;

    public TaskService(TimeTrackingContext dbContext)
    {
        _dbContext = dbContext;
    }

    private DateTime GetIndianTime()
    {
        TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone);
    }

    public async Task<TaskSession> StartTaskAsync(int userId, int taskTypeId)
    {
        var active = await _dbContext.TaskSessions
            .FirstOrDefaultAsync(t => t.UserId == userId && t.EndTime == null);
        if (active != null)
        {
            active.EndTime = GetIndianTime();
        }

        var session = new TaskSession
        {
            UserId = userId,
            TaskId = taskTypeId,
            StartTime = GetIndianTime()
        };

        _dbContext.TaskSessions.Add(session);
        await _dbContext.SaveChangesAsync();
        return session;
    }

    public async Task<bool> EndCurrentTaskAsync(int userId)
    {
        var active = await _dbContext.TaskSessions
            .FirstOrDefaultAsync(t => t.UserId == userId && t.EndTime == null);
        if (active == null) return false;

        active.EndTime = GetIndianTime();
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<TaskSession>> GetTaskHistoryAsync(int userId)
    {
        return await _dbContext.TaskSessions
            .Where(t => t.UserId == userId)
            .Include(t => t.Task)
            .OrderByDescending(t => t.StartTime)
            .ToListAsync();
    }

    public async Task<TaskSession> GoOnBreakAsync(int userId, string breakType)
    {
        if (breakType != "Lunch" && breakType != "DayOff")
            throw new Exception("Invalid break type.");

        var breakTaskType = await _dbContext.Tasks.FirstOrDefaultAsync(t => t.Name == breakType);
        if (breakTaskType == null)
            throw new Exception("Break task type not found.");

        return await StartTaskAsync(userId, breakTaskType.Id);
    }
}
