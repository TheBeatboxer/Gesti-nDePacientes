import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLogged()) {
      const user = this.auth.getUser();
      if (user && user.roles.includes('ADMIN')) {
        this.router.navigate(['/admin-dashboard']);
      } else if (user && user.roles.includes('NURSE')) {
        this.router.navigate(['/nurse-dashboard']);
      } else if (user && user.roles.includes('PATIENT')) {
        this.router.navigate(['/patient-profile']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return false;
    }
    return true;
  }
}
