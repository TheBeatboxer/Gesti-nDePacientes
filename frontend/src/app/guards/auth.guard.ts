import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isLogged()) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['expectedRole'];
    const user = this.auth.getUser();
    if (expectedRole && !this.auth.hasRole(expectedRole)) {
      this.router.navigate(['/not-found']);
      return false;
    }

    return true;
  }
}
