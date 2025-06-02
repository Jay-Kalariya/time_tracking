using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;
using Dotnet1.DTOs;

namespace Dotnet1.Services
{
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

        public async Task<TaskSession> StartTaskAsync(int userId, int taskId)
        {
            var active = await _dbContext.TaskSessions
                .FirstOrDefaultAsync(t => t.UserId == userId && t.EndTime == null);

            var newTask = await _dbContext.Tasks.FindAsync(taskId);

            if (active != null)
            {
                if (new[] { "Day Off", "Lunch", "Break" }.Contains(newTask?.Name))
                    throw new InvalidOperationException("Please end your current task before starting a break or day off.");

                active.EndTime = GetIndianTime();
                await _dbContext.SaveChangesAsync();
            }

            var newSession = new TaskSession
            {
                UserId = userId,
                TaskId = taskId,
                StartTime = GetIndianTime(),
                EndTime = null
            };

            _dbContext.TaskSessions.Add(newSession);
            await _dbContext.SaveChangesAsync();
            return newSession;
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

        public async Task<TaskSession> GoOnBreakAsync(int userId, string breakType)
        {
            var active = await _dbContext.TaskSessions
                .FirstOrDefaultAsync(t => t.UserId == userId && t.EndTime == null);

            if (active != null)
                throw new InvalidOperationException("Please end your current task before starting a break.");

            var breakTask = await _dbContext.Tasks.FirstOrDefaultAsync(t => t.Name == breakType);
            if (breakTask == null)
                throw new ArgumentException("Invalid break type");

            var breakSession = new TaskSession
            {
                UserId = userId,
                TaskId = breakTask.Id,
                StartTime = GetIndianTime(),
                EndTime = null
            };

            _dbContext.TaskSessions.Add(breakSession);
            await _dbContext.SaveChangesAsync();
            return breakSession;
        }

      public async Task<List<TaskSessionDto>> GetTaskHistoryAsync(int userId)
{
    var sessions = await _dbContext.TaskSessions
        .Where(t => t.UserId == userId)
        .Include(t => t.Task)
        .OrderByDescending(t => t.StartTime)
        .ToListAsync();

    // Compute duration after fetching
    return sessions.Select(t => new TaskSessionDto
    {
        Id = t.Id,
        TaskId = t.TaskId,
        TaskName = t.Task?.Name ?? "Unknown",
        StartTime = t.StartTime,
        EndTime = t.EndTime,
        Duration = t.EndTime.HasValue ? (t.EndTime.Value - t.StartTime).TotalSeconds : 0
    }).ToList();
}
    }
}
