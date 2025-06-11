import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Make optional, used for create only or password change when editing
      role: ['User', Validators.required],
      newPassword: [''] // <-- Add new control for changing password
    });
  }

  searchTerm: string = '';

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

  // onSubmit(): void {
  //   const data = this.userForm.value;

  //   this.getAuthHeaders((headers) => {
  //     if (this.editingUserId) {
  //       // Exclude password for update
  //       const updateData = {
  //         username: data.username,
  //         email: data.email,
  //         role: data.role
  //       };

  //       this.http.put(`http://localhost:5236/api/User/${this.editingUserId}`, updateData, { headers }).subscribe(() => {
  //         this.fetchUsers();
  //         this.resetForm();
  //       });
  //     } else {
  //       this.http.post('http://localhost:5236/api/auth/register', data, { headers }).subscribe(() => {
  //         this.fetchUsers();
  //         this.resetForm();
  //       });
  //     }
  //   });
  // }



  onSubmit(): void {
    const data = this.userForm.value;

    this.getAuthHeaders((headers) => {
      if (this.editingUserId) {
        // Update user info except password
        const updateData = {
          username: data.username,
          email: data.email,
          role: data.role
        };

        this.http.put(`http://localhost:5236/api/User/${this.editingUserId}`, updateData, { headers }).subscribe(() => {
          // If newPassword field has value, update password
          if (data.newPassword && data.newPassword.trim() !== '') {
            this.http.put(
              `http://localhost:5236/api/User/${this.editingUserId}/password`, // ✅ "User" with capital U
              { newPassword: data.newPassword },
              { headers }

            ).subscribe({
              next: () => {
                this.fetchUsers();
                this.resetForm();
              },
              error: (err) => {
                console.error('Error updating password', err);
                // Optionally show error message to user
              }
            });
          } else {
            this.fetchUsers();
            this.resetForm();
          }
        });
      } else {
        // Creating new user (password required)
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
      password: '',      // keep empty (create password not used on edit)
      newPassword: '',   // reset new password field
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

  viewUser(user: User): void {
    this.router.navigate(['/user-details', user.id]);
  }



  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }


  goadmintask(){
    this.router.navigate(['/admintask']);
  }

  goviewtask(){
      this.router.navigate(['/admintaskview'])
  }


}
