import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskService } from '../services/task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './userdeshbaord.component.html',
  styleUrls: ['./userdeshbaord.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  tasks = [
    { id: 1, name: 'Task A' },
    { id: 2, name: 'Task B' },
    { id: 3, name: 'Break' },
    { id: 4, name: 'Lunch' },
    { id: 5, name: 'Day Off' }
  ];

  selectedTask: { id: number; name: string } | null = null;
  timer: any;
  seconds = 0;
  isPaused = false;
  isLoggedIn = false;
  currentISTTime: string = '';
  resumeSeconds = 0;
  showStartButton = false;
  nonWorkingPeriodActive = false;

  userTaskHistory: any[] = [];
  filteredHistory: any[] = [];
  showHistory = false;

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  filterDate: string = '';
  

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    this.updateCurrentISTTime();
    setInterval(() => this.updateCurrentISTTime(), 1000);

    this.taskService.getUserHistoryTask().subscribe({
      next: (history) => {
        this.userTaskHistory = history;
        this.applyFiltersAndPagination();
        this.showHistory = true;
      },
      error: () => alert('Failed to load task history')
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  updateCurrentISTTime() {
    const nowUTC = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(nowUTC.getTime() + istOffset);
    this.currentISTTime = istTime.toLocaleString('en-IN', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  }

  selectTask(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newTaskId = +target.value;
    const newTask = this.tasks.find(t => t.id === newTaskId) || null;

    if (this.selectedTask) {
      this.taskService.endTask().subscribe({
        next: () => this.startNewTask(newTask),
        error: (err) => alert('Failed to end current task. Please try again.')
      });
    } else {
      this.startNewTask(newTask);
    }
  }

  startNewTask(task: { id: number; name: string } | null) {
    if (!task) return;

    if (this.nonWorkingPeriodActive && !['Lunch', 'Break', 'Day Off'].includes(task.name)) {
      alert('You cannot start a working task while on a break or day off.');
      return;
    }

    this.taskService.startTask(task.id).subscribe({
      next: () => {
        this.selectedTask = task;
        this.seconds = 0;
        this.resumeSeconds = 0;
        this.showStartButton = false;
        this.startTimer();
        this.nonWorkingPeriodActive = ['Lunch', 'Break', 'Day Off'].includes(task.name);
      },
      error: () => alert('Failed to start the task. Please try again.')
    });
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.isPaused) this.seconds++;
    }, 1000);
    this.isPaused = false;
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPaused = true;
  }

  pushTask() {
    this.taskService.endTask().subscribe({
      next: () => {
        alert('Task pushed!');
        this.stopTimer();
        this.resumeSeconds = this.seconds;
        this.showStartButton = true;
        this.selectedTask = null;
        this.nonWorkingPeriodActive = false;
      },
      error: () => alert('Failed to push the task. Please try again.')
    });
  }

  resumeTask() {
    this.seconds = this.resumeSeconds;
    this.startTimer();
    this.showStartButton = false;
  }

  stopCurrentBreak() {
    if (this.selectedTask && ['Lunch', 'Break', 'Day Off'].includes(this.selectedTask.name)) {
      this.taskService.endTask().subscribe({
        next: () => {
          alert(`${this.selectedTask?.name} ended`);
          this.nonWorkingPeriodActive = false;
          this.stopTimer();
          this.seconds = 0;
          this.selectedTask = null;
          this.showStartButton = false;
        },
        error: () => alert('Failed to end break. Please try again.')
      });
    }
  }

  dayOff() {
    if (this.nonWorkingPeriodActive) {
      alert('You already have an active break or day off.');
      return;
    }

    const dayOffTask = this.tasks.find(t => t.name === 'Day Off');
    if (!dayOffTask) return;

    this.taskService.startTask(dayOffTask.id).subscribe({
      next: () => {
        alert('Marked as Day Off');
        this.stopTimer();
        this.seconds = 0;
        this.selectedTask = dayOffTask;
        this.showStartButton = false;
        this.nonWorkingPeriodActive = true;
      },
      error: () => alert('Failed to mark Day Off. Please try again.')
    });
  }

  stopTask() {
    if (this.selectedTask) {
      this.taskService.endTask().subscribe({
        next: () => {
          alert('Task stopped and saved to database.');
          this.stopTimer();
          this.seconds = 0;
          this.selectedTask = null;
          this.showStartButton = false;
          this.nonWorkingPeriodActive = false;
        },
        error: () => alert('Failed to stop task. Please try again.')
      });
    } else {
      alert('No active task to stop.');
    }
  }

  formatTime(): string {
    const h = Math.floor(this.seconds / 3600);
    const m = Math.floor((this.seconds % 3600) / 60);
    const s = this.seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

applyFiltersAndPagination() {
  let filtered = this.userTaskHistory;

  if (this.filterDate) {
    const selectedDate = new Date(this.filterDate);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    filtered = filtered.filter(entry => {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      return (
        (start >= selectedDate && start < nextDay) ||
        (end >= selectedDate && end < nextDay)
      );
    });
  }

  this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.filteredHistory = filtered.slice(startIndex, endIndex);
}


  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

 formatDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '0h 0m 0s';
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}
}
