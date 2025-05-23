  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import {jwtDecode} from 'jwt-decode';

  @Injectable({
    providedIn: 'root'
  })
  export class AuthService {
    private apiUrl = 'http://localhost:5236/api/Auth';
    private tokenKey = 'token';  // consistent key everywhere

    constructor(private http: HttpClient) {}

    login(credentials: { email: string; password: string }) {
      return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials);
    }

    setToken(token: string) {
      localStorage.setItem(this.tokenKey, token);
      chrome.storage.local.set({ [this.tokenKey]: token }, () => {
        console.log('Token stored in chrome.storage');
      });
    }

    getToken(): string | null {
      return localStorage.getItem(this.tokenKey);
    }

    getRole(): string | null {
      const token = this.getToken();
      if (!token) return null;

      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token:', decoded);

        // Defensive: check multiple possible claim keys (some JWTs use different claim keys)
        const role =
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          decoded['role'] ||
          decoded['roles'] || 
          null;

        if (!role) {
          console.warn('Role claim not found in token');
        }

        return role;
      } catch (error) {
        console.error('JWT decode error:', error);
        return null;
      }
    }

    logout() {
      chrome.storage.local.remove(this.tokenKey, () => {
        console.log('Token removed from chrome.storage');
      });
      localStorage.removeItem(this.tokenKey);
    }
  }
