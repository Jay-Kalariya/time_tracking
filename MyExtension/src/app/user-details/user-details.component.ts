import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  imports:[FormsModule,CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId!: number;
  userInfo: any;
  taskHistory: any[] = [];
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserData();
  }

  private loadUserData(): void {
    // Wrap chrome.storage.local.get in a Promise to use async/await pattern
    this.getToken()
      .then(token => {
        if (!token) {
          this.errorMessage = 'User not authenticated';
          return;
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        // Fetch user info
        this.http.get(`http://localhost:5236/api/User/${this.userId}`, { headers }).subscribe({
          next: data => this.userInfo = data,
          error: err => {
            console.error('Failed to fetch user info', err);
            this.errorMessage = 'Failed to load user info.';
          }
        });

        // Fetch task history for user (admin endpoint)
        this.http.get<any[]>(`http://localhost:5236/api/task/admin/history/${this.userId}`, { headers }).subscribe({
          next: data => this.taskHistory = data,
          error: err => {
            console.error('Failed to fetch task history', err);
            this.errorMessage = 'Failed to load task history.';
          }
        });
      })
      .catch(err => {
        console.error('Error fetching token', err);
        this.errorMessage = 'Authentication error.';
      });
  }

  private getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['token'], (result) => {
        resolve(result['token'] || null);
      });
    });
  }

  calculateDuration(start: string, end: string): string {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime.getTime() - startTime.getTime()) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
