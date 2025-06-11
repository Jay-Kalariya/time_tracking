import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { AdminTaskService, Task } from '../services/admin-task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-task',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './admintask.component.html',
  styleUrls: ['./admintask.component.css']
})
export class AdminTaskComponent implements OnInit {
  tasks: Task[] = [];
  taskForm: FormGroup;

  constructor(
    private taskService: AdminTaskService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllTasks();
  }

  getAllTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (res) => (this.tasks = res),
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    const name = this.taskForm.value.name?.trim();
    if (!name) {
      alert('Task name is required');
      return;
    }

    const task: Task = { name, id: 0 };

    this.taskService.createTask(task).subscribe(() => {
      alert('Task created successfully!');
      this.taskForm.reset(); // ✅ Clear the input field
      this.getAllTasks();    // ✅ Refresh task list
    });
  }
}
