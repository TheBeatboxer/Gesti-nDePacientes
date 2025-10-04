import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';
  constructor(private http: HttpClient, private router: Router) {}
  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(map(res => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          // Redirect based on role
          if (res.user.roles.includes('ADMIN')) {
            this.router.navigate(['/admin-dashboard']);
          } else if (res.user.roles.includes('NURSE')) {
            this.router.navigate(['/nurse-dashboard']);
          } else if (res.user.roles.includes('PATIENT')) {
            this.router.navigate(['/patient-profile']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
        return res;
      }));
  }
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
  getToken() { return localStorage.getItem(this.tokenKey); }
  getUser() { return JSON.parse(localStorage.getItem(this.userKey) || 'null'); }
  isLogged() { return !!this.getToken(); }
  hasRole(role: string) {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }
}
