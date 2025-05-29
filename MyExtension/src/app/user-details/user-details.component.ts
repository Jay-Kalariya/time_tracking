import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId!: number;
  userInfo: any;
  taskHistory: any[] = [];
  breakHistory: any[] = [];
  errorMessage: string = '';

  aggregatedTaskHistory: any[] = [];
  breakSummary: any[] = [];
  lunchBreakTotal: string = '';

  searchTerm: string = '';  // <---- Add this for ngModel binding

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserData();
  }

  private getToken(): Promise<string | null> {
    return Promise.resolve(localStorage.getItem('token'));
  }

  private loadUserData(): void {
    this.getToken()
      .then(token => {
        if (!token) {
          this.errorMessage = 'User not authenticated';
          return;
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        this.http.get(`http://localhost:5236/api/User/${this.userId}`, { headers }).subscribe({
          next: data => this.userInfo = data,
          error: err => {
            this.errorMessage = 'Failed to load user info.';
          }
        });

        this.http.get<any[]>(`http://localhost:5236/api/task/admin/history/${this.userId}`, { headers }).subscribe({
          next: data => {
            // Separate tasks and breaks
            this.breakHistory = data.filter(t => t.taskName === 'Lunch' || t.taskName === 'DayOff');
            this.taskHistory = data.filter(t => !(t.taskName === 'Lunch' || t.taskName === 'DayOff'));

            this.aggregateTaskHistory();
            this.processBreaks();
          },
          error: err => {
            this.errorMessage = 'Failed to load task history.';
          }
        });
      })
      .catch(err => {
        this.errorMessage = 'Authentication error.';
      });
  }

  // Filtered tasks based on search term (getter)
  get filteredTaskHistory() {
    if (!this.searchTerm) {
      return this.aggregatedTaskHistory;
    }
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.aggregatedTaskHistory.filter(task =>
      task.taskName.toLowerCase().includes(lowerSearch) || task.date.includes(lowerSearch)
    );
  }

  // Sum total time of filtered tasks
  getTotalTimeForFiltered(): string {
    const totalSeconds = this.filteredTaskHistory.reduce((sum, task) => {
      // Extract totalSeconds from totalDuration string is complicated, so better keep seconds separately in aggregatedTaskHistory
      // Let's modify aggregateTaskHistory to store totalSeconds as well (already done).
      return sum + (task.totalSeconds || 0);
    }, 0);
    return this.formatDuration(totalSeconds);
  }

  // Group work tasks by date and taskName
  aggregateTaskHistory() {
    const grouped = new Map<string, { taskName: string; totalSeconds: number; date: string }>();

    for (const task of this.taskHistory) {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      const date = start.toISOString().split('T')[0];
      const key = `${date}_${task.taskName}`;

      const duration = (end.getTime() - start.getTime()) / 1000;

      if (grouped.has(key)) {
        grouped.get(key)!.totalSeconds += duration;
      } else {
        grouped.set(key, { taskName: task.taskName, totalSeconds: duration, date });
      }
    }

    this.aggregatedTaskHistory = Array.from(grouped.values()).map(g => ({
      ...g,
      totalDuration: this.formatDuration(g.totalSeconds),
    }));
  }

  // Aggregate breaks by date and break type
  processBreaks() {
    const grouped = new Map<string, { breakType: string; totalSeconds: number; date: string }>();

    for (const b of this.breakHistory) {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const date = start.toISOString().split('T')[0];
      const key = `${date}_${b.taskName}`;

      const duration = (end.getTime() - start.getTime()) / 1000;

      if (grouped.has(key)) {
        grouped.get(key)!.totalSeconds += duration;
      } else {
        grouped.set(key, { breakType: b.taskName, totalSeconds: duration, date });
      }
    }

    this.breakSummary = Array.from(grouped.values()).map(g => ({
      ...g,
      totalDuration: this.formatDuration(g.totalSeconds),
    }));

    // Calculate total lunch break duration across all days
    const lunchSeconds = this.breakSummary
      .filter(b => b.breakType === 'Lunch')
      .reduce((sum, b) => sum + b.totalSeconds, 0);

    this.lunchBreakTotal = this.formatDuration(lunchSeconds);
  }

  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  calculateDuration(start: string, end: string): string {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime.getTime() - startTime.getTime()) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  goToAdminDashboard() {
    this.router.navigate(['/admindashboard']);
  }
}
