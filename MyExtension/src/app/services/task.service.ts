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
    return this.http.post(`${this.apiUrl}/break`, breakType, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  getHistory() {
    return this.http.get(`${this.apiUrl}/history`);
  }

  getUserHistory(userId: number) {
  return this.http.get<any[]>(`http://localhost:5236/api/User/${userId}/history`);
}

}