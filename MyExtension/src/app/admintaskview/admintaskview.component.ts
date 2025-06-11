import { Component, OnInit } from '@angular/core';
import { AdminTaskService, Task, TaskAssignmentDto } from '../services/admin-task.service';
import { UserService } from '../services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../modals/user.modals';
@Component({
  selector: 'app-admintaskview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admintaskview.component.html',
  styleUrls: ['./admintaskview.component.css']
})
export class AdmintaskviewComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  taskForm: FormGroup;
  editingTaskId: number | null = null;
  isLoading = true;

  constructor(
    private taskService: AdminTaskService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      name: ['', { nonNullable: true }]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadTasks();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks.filter(task =>
          !task.isProtected &&
          !['break', 'lunch', 'day off'].includes(task.name.toLowerCase())
        );
        this.loadAssignments();
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.isLoading = false;
      }
    });
  }

  loadAssignments(): void {
    this.taskService.getAllAssignments().subscribe({
      next: (assignments) => {
        const assignmentsMap = new Map<number, User[]>();
        
        assignments.forEach(assignment => {
          if (!assignmentsMap.has(assignment.taskId)) {
            assignmentsMap.set(assignment.taskId, []);
          }
          const user = this.users.find(u => u.id === assignment.userId);
          if (user) {
            assignmentsMap.get(assignment.taskId)!.push(user);
          }
        });

        this.tasks = this.tasks.map(task => ({
          ...task,
          assignedUsers: assignmentsMap.get(task.id) || []
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load assignments', err);
        this.isLoading = false;
      }
    });
  }

  editTask(task: Task): void {
    this.editingTaskId = task.id;
    this.taskForm.patchValue({ name: task.name });
  }

  updateTask(): void {
    if (this.editingTaskId !== null) {
      const { name } = this.taskForm.getRawValue();
      const updatedTask: Task = {
        id: this.editingTaskId,
        name
      };
      
      this.taskService.updateTask(this.editingTaskId, updatedTask).subscribe({
        next: () => {
          this.loadTasks();
          this.cancelEdit();
        },
        error: () => alert('Failed to update task')
      });
    }
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.taskForm.reset();
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => this.loadTasks(),
        error: () => alert('Failed to delete task')
      });
    }
  }

  onUserSelect(event: Event, taskId: number): void {
    const userId = Number((event.target as HTMLSelectElement).value);
    if (!isNaN(userId)) {
      this.taskService.assignTaskToUser(taskId, userId).subscribe({
        next: () => {
          this.loadAssignments();
          (event.target as HTMLSelectElement).value = '';
        },
        error: () => alert('Failed to assign task')
      });
    }
  }

  unassignTask(taskId: number, userId: number): void {
    this.taskService.unassignTaskFromUser(taskId, userId).subscribe({
      next: () => this.loadAssignments(),
      error: () => alert('Failed to unassign task')
    });
  }
}