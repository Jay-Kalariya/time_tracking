using Dotnet1.Models;
using Dotnet1.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DotnetTask = Dotnet1.Models.Task;

namespace Dotnet1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminTaskController : ControllerBase
    {
        private readonly AdminTaskService _service;

        public AdminTaskController(AdminTaskService service)
        {
            _service = service;
        }

        [HttpGet]
        public async System.Threading.Tasks.Task<ActionResult<IEnumerable<DotnetTask>>> GetAllTasks()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async System.Threading.Tasks.Task<ActionResult<DotnetTask>> GetTask(int id)
        {
            var task = await _service.GetByIdAsync(id);
            return task == null ? NotFound() : Ok(task);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult<DotnetTask>> CreateTask(DotnetTask task)
        {
            var created = await _service.CreateAsync(task);
            return CreatedAtAction(nameof(GetTask), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> UpdateTask(int id, DotnetTask task)
        {
            var result = await _service.UpdateAsync(id, task);
            return result ? NoContent() : BadRequest("Cannot update protected or missing task.");
        }

        [HttpDelete("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> DeleteTask(int id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? NoContent() : BadRequest("Cannot delete protected or missing task.");
        }

        [HttpPost("assign")]
        public async System.Threading.Tasks.Task<IActionResult> AssignTask([FromBody] TaskAssignmentDto dto)
        {
            var session = await _service.AssignTaskAsync(dto);
            return session == null ? BadRequest("Invalid user or task.") : Ok(session);
        }
    }
}
