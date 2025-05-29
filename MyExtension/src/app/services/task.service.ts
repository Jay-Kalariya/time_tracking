import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  getUserHistory(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/admin/history/${userId}`);
  }


}