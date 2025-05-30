import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  userForm: FormGroup;
  users: User[] = [];
  editingUserId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required], // Only used for creating new users
      role: ['User', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  private getAuthHeaders(callback: (headers: HttpHeaders) => void) {
    chrome.storage.local.get(['token'], (result) => {
      const token = result['token'];
      if (token) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        callback(headers);
      } else {
        console.error('No token found in chrome.storage');
        // Optionally redirect to login or handle unauthorized access
      }
    });
  }

  fetchUsers(): void {
    this.getAuthHeaders((headers) => {
      this.http.get<User[]>('http://localhost:5236/api/User', { headers }).subscribe({
        next: (res) => this.users = res,
        error: (err) => console.error('Error fetching users', err)
      });
    });
  }

  onSubmit(): void {
    const data = this.userForm.value;

    this.getAuthHeaders((headers) => {
      if (this.editingUserId) {
        // Exclude password for update
        const updateData = {
          username: data.username,
          email: data.email,
          role: data.role
        };

        this.http.put(`http://localhost:5236/api/User/${this.editingUserId}`, updateData, { headers }).subscribe(() => {
          this.fetchUsers();
          this.resetForm();
        });
      } else {
        this.http.post('http://localhost:5236/api/auth/register', data, { headers }).subscribe(() => {
          this.fetchUsers();
          this.resetForm();
        });
      }
    });
  }

  editUser(user: User): void {
    this.editingUserId = user.id;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      password: '', // reset password field
      role: user.role
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.getAuthHeaders((headers) => {
        this.http.delete(`http://localhost:5236/api/User/${userId}`, { headers }).subscribe(() => {
          this.fetchUsers();
        });
      });
    }
  }

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset({ role: 'User' });
  }
}
