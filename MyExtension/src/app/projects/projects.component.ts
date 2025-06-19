import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../services/project.service';
import { TaskService, Task } from '../services/task.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project',
  imports:[FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectComponent implements OnInit {
  projectForm!: FormGroup;
  projects: Project[] = [];
  tasks: Task[] = [];
  message = '';
  error = '';
  selectedProject: Project | null = null;
  selectedTaskId: number | null = null;
  selectedProjectIdForAssignment: number | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.loadProjects();
    this.loadTasks();
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (data) => this.projects = data,
      error: () => this.error = '❌ Failed to load projects'
    });
  }

  loadTasks() {
    this.taskService.getAllTasks().subscribe({
      next: (res) => this.tasks = res,
      error: () => this.error = '❌ Failed to load tasks'
    });
  }

  createOrUpdateProject() {
    if (this.projectForm.invalid) return;

    if (this.selectedProject) {
      this.projectService.updateProject(this.selectedProject.id!, this.projectForm.value).subscribe({
        next: () => {
          this.message = '✅ Project updated!';
          this.error = '';
          this.selectedProject = null;
          this.projectForm.reset();
          this.loadProjects();
        },
        error: () => this.error = '❌ Failed to update project'
      });
    } else {
      this.projectService.createProject(this.projectForm.value).subscribe({
        next: () => {
          this.message = '✅ Project created successfully!';
          this.error = '';
          this.projectForm.reset();
          this.loadProjects();
        },
        error: () => {
          this.error = '❌ Error creating project';
          this.message = '';
        }
      });
    }
  }

  assignTaskToProject() {
    if (!this.selectedTaskId || !this.selectedProjectIdForAssignment) return;
    this.projectService.assignTask(this.selectedTaskId, this.selectedProjectIdForAssignment).subscribe({
      next: () => {
        this.message = '✅ Task assigned!';
        this.loadProjects();
      },
      error: () => this.error = '❌ Task assignment failed'
    });
  }

  selectProjectForEdit(project: Project) {
    this.selectedProject = project;
    this.projectForm.patchValue({ name: project.name });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.message = '✅ Project deleted!';
          this.loadProjects();
        },
        error: () => this.error = '❌ Delete failed'
      });
    }
  }

  cancelEdit() {
    this.selectedProject = null;
    this.projectForm.reset();
  }
}
