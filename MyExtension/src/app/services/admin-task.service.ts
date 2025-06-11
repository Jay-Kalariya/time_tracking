import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../modals/user.modals';

export interface Task {
  id: number;
  name: string;
  isProtected?: boolean;
  assignedUsers?: User[];
}

export interface TaskAssignmentDto {
  taskId: number;
  userId: number;
  taskName?: string;
  userName?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminTaskService {
  private apiUrl = 'http://localhost:5236/api/Task';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTaskToUser(taskId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign/${taskId}/${userId}`, {});
  }

  unassignTaskFromUser(taskId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/unassign/${taskId}/${userId}`);
  }

  getAllAssignments(): Observable<TaskAssignmentDto[]> {
    return this.http.get<TaskAssignmentDto[]>(`${this.apiUrl}/assignments`);
  }
}