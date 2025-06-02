import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TaskSessionDto {
  id: number;
  taskId: number;
  taskName: string;
  startTime: string; // usually ISO string from API
  endTime?: string | null;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5236/api/Task';
  constructor(private http: HttpClient) {}


  
  startTask(taskTypeId: number) {
    return this.http.post(`${this.apiUrl}/start`, { taskTypeId });
  }
  endTask() {
    return this.http.post(`${this.apiUrl}/end`, {});
  }
 startBreak(breakType: string) {
  return this.http.post(`${this.apiUrl}/break`, JSON.stringify(breakType), {
    headers: { 'Content-Type': 'application/json' }
  });
}
  getHistory() {
    return this.http.get(`${this.apiUrl}/history`);
  }
// ✅ Fixed endpoint for admin history
 // ✅ Correct
getUserHistory(userId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/admin/history/${userId}`);
}
getUserHistoryTask(): Observable<TaskSessionDto[]> {
  return this.http.get<TaskSessionDto[]>(`${this.apiUrl}/history`);
}



}