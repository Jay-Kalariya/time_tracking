import { Component, OnInit } from '@angular/core';
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
export class UserDashboardComponent implements OnInit {
  tasks = [
    { id: 1, name: 'Task A' },
    { id: 2, name: 'Task B' },
    { id: 3, name: 'Break' }
  ];
  selectedTaskId: number | null = null;
  timer: any;
  seconds = 0;
  isPaused = false;
  isLoggedIn = false;
  currentISTTime: string = '';

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    this.updateCurrentISTTime();
    setInterval(() => this.updateCurrentISTTime(), 1000);

    // Optional: fetch tasks dynamically
    // this.taskService.getAvailableTasks().subscribe(tasks => this.tasks = tasks);
  }

  updateCurrentISTTime() {
    const nowUTC = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
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

    if (this.selectedTaskId !== null) {
      this.taskService.endTask().subscribe(() => {
        this.stopTimer();
        this.taskService.startTask(newTaskId).subscribe(() => {
          this.selectedTaskId = newTaskId;
          this.startTimer();
        });
      });
    } else {
      this.taskService.startTask(newTaskId).subscribe(() => {
        this.selectedTaskId = newTaskId;
        this.startTimer();
      });
    }
  }

  startTimer() {
    this.seconds = 0;
    this.isPaused = false;
    this.timer = setInterval(() => {
      if (!this.isPaused) this.seconds++;
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.seconds = 0;
  }

  pushTask() {
    this.taskService.endTask().subscribe(() => {
      alert('Task pushed!');
      this.stopTimer();
      this.selectedTaskId = null;
    });
  }

  lunchBreak() {
    this.taskService.startBreak('Lunch').subscribe(() => {
      alert('Lunch break started');
      this.stopTimer();
      this.selectedTaskId = null;
    });
  }

  dayOff() {
    this.taskService.startBreak('DayOff').subscribe(() => {
      alert('Marked as Day Off');
      this.stopTimer();
      this.selectedTaskId = null;
    });
  }

  formatTime(): string {
    const h = Math.floor(this.seconds / 3600);
    const m = Math.floor((this.seconds % 3600) / 60);
    const s = this.seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }
}
