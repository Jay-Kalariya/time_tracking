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

    public async Task<TaskSession> StartTaskAsync(int userId, int taskTypeId)
    {
        // End any active session
        var active = await _dbContext.TaskSessions
            .FirstOrDefaultAsync(t => t.UserId == userId && t.EndTime == null);

        if (active != null)
        {
            active.EndTime = DateTime.UtcNow;
        }

        var session = new TaskSession
        {
            UserId = userId,
            TaskId = taskTypeId,
            StartTime = DateTime.UtcNow
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

        active.EndTime = DateTime.UtcNow;
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
        // Assume breakType can be: "Break", "Lunch", "DayOff"
        var breakTaskType = await _dbContext.Tasks.FirstOrDefaultAsync(t => t.Name == breakType);
        if (breakType != "short" && breakType != "long")
        {
            throw new Exception("Invalid break type.");
        }

        return await StartTaskAsync(userId, breakTaskType.Id);
    }
}
