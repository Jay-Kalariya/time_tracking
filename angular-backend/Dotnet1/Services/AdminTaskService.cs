using Dotnet1.Models;
using Microsoft.EntityFrameworkCore;
using DotnetTask = Dotnet1.Models.Task;

namespace Dotnet1.Services
{
    public class AdminTaskService
    {
        private readonly TimeTrackingContext _context;

        public AdminTaskService(TimeTrackingContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task<List<DotnetTask>> GetAllAsync()
        {
            return await _context.Tasks.ToListAsync();
        }

        public async System.Threading.Tasks.Task<DotnetTask?> GetByIdAsync(int id)
        {
            return await _context.Tasks.FindAsync(id);
        }

        public async System.Threading.Tasks.Task<DotnetTask> CreateAsync(DotnetTask task)
        {
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async System.Threading.Tasks.Task<bool> UpdateAsync(int id, DotnetTask updatedTask)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.IsProtected) return false;

            task.Name = updatedTask.Name;
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task<bool> DeleteAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null || task.IsProtected) return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task<TaskSession?> AssignTaskAsync(TaskAssignmentDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            var task = await _context.Tasks.FindAsync(dto.TaskId);

            if (user == null || task == null) return null;

            var session = new TaskSession
            {
                UserId = dto.UserId,
                TaskId = dto.TaskId,
                StartTime = DateTime.UtcNow
            };

            _context.TaskSessions.Add(session);
            await _context.SaveChangesAsync();

            return session;
        }
    }
}
