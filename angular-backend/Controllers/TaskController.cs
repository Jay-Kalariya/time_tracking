using Dotnet1.Models;
using Dotnet1.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dotnet1.DTOs;
using System.Security.Claims;

namespace Dotnet1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // All authenticated users can access this
    public class TaskController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TaskController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // POST api/task/start
        [HttpPost("start")]
        public async Task<IActionResult> StartTaskAsync([FromBody] TaskStartDto startTaskDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var session = await _taskService.StartTaskAsync(userId, startTaskDto.TaskTypeId);
            return Ok(session);
        }

        // POST api/task/end
        [HttpPost("end")]
        public async Task<IActionResult> EndCurrentTaskAsync()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var success = await _taskService.EndCurrentTaskAsync(userId);
            if (!success)
                return NotFound("No active task session found.");

            return Ok(new { message = "Task ended successfully." });
        }

        // POST api/task/break
        [HttpPost("break")]
        public async Task<IActionResult> GoOnBreakAsync([FromBody] string breakType)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var session = await _taskService.GoOnBreakAsync(userId, breakType);
            return Ok(session);
        }

        // GET api/task/history
        [HttpGet("history")]
        public async Task<IActionResult> GetTaskHistoryAsync()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var history = await _taskService.GetTaskHistoryAsync(userId);
            return Ok(history);
        }
    }
}
