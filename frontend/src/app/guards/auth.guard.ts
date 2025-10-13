import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Route activated for path:', state.url);
    console.log('AuthGuard: Checking if user is logged in');
    if (!this.auth.isLogged()) {
      console.log('AuthGuard: User not logged in, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('AuthGuard: User is logged in');
    const expectedRole = route.data['expectedRole'];
    const user = this.auth.getUser();
    console.log('AuthGuard: Expected role:', expectedRole);
    console.log('AuthGuard: User data:', user);
    console.log('AuthGuard: User roles:', user?.roles);
    if (expectedRole && !this.auth.hasRole(expectedRole)) {
      console.log('AuthGuard: User does not have required role, redirecting to /not-found');
      this.router.navigate(['/not-found']);
      return false;
    }

    console.log('AuthGuard: Access granted');
    return true;
  }
}
