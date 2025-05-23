import { Component,OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var chrome: any;

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  credentials = { email: '', password: '' };
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    chrome.storage.local.get(['token'], (result: any) => {
      const token = result.token;
      if (token) {
        this.auth.setToken(token);
        const role = this.auth.getRole();
        if (role === 'Admin') {
          this.router.navigate(['/admindashboard'], { replaceUrl: true });
        } else if (role) {
          this.router.navigate(['/userdashboard'], { replaceUrl: true });
        }
      }
    });
  }

  login() {
  this.auth.login(this.credentials).subscribe({
    next: (res: any) => {
      // Save token to chrome.storage.local
      chrome.storage.local.set({ token: res.token }, () => {
        // Then call setToken and navigate
        this.auth.setToken(res.token);
        const role = this.auth.getRole();

        if (role === 'Admin') {
          this.router.navigate(['/admindashboard']);
        } else if (role) {
          this.router.navigate(['/userdashboard']);
        }
      });
    },
    error: () => {
      this.errorMessage = 'Invalid email or password';
    }
  });
}

}
