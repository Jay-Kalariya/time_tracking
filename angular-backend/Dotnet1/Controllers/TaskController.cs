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
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TaskController(TaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartTaskAsync([FromBody] TaskStartDto startTaskDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            try
            {
                var session = await _taskService.StartTaskAsync(userId, startTaskDto.TaskTypeId);
                return Ok(session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("end")]
        public async Task<IActionResult> EndCurrentTaskAsync()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var success = await _taskService.EndCurrentTaskAsync(userId);
            if (!success)
                return NotFound("No active task session found.");

            return Ok(new { message = "Task ended successfully." });
        }

        [HttpPost("break")]
        public async Task<IActionResult> GoOnBreakAsync([FromBody] string breakType)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var session = await _taskService.GoOnBreakAsync(userId, breakType);
                return Ok(session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetTaskHistoryAsync()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var history = await _taskService.GetTaskHistoryAsync(userId);
            return Ok(history);
        }

   [HttpGet("admin/history/{userId}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetUserTaskHistory(int userId)
{
    try
    {
        var history = await _taskService.GetTaskHistoryAsync(userId);
        return Ok(history);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Failed to fetch task history for user {userId}: {ex}");
        return StatusCode(500, new { message = "Failed to get task history", error = ex.Message });
    }
}


    }
}
