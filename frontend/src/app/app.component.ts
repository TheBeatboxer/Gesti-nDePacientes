import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { SidebarService } from './services/sidebar.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" *ngIf="!isLogin">
      <mat-toolbar-row>
        <div class="header-content">
          <div class="logo-section">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            <span class="app-title">Gestión de Pacientes</span>
            <mat-icon class="menu-icon" (click)="toggleSidebar()">menu</mat-icon>
          </div>
          <div class="actions-section">
            <ng-container *ngIf="auth.isLogged(); else notLogged">
              <button mat-button (click)="goHome()">
                <mat-icon>home</mat-icon>
                Inicio
              </button>
              <button mat-icon-button (click)="goNotifications()">
                <mat-icon>notifications</mat-icon>
              </button>
              <button mat-icon-button (click)="goProfile()">
                <mat-icon>person</mat-icon>
              </button>
              <span class="user-name">{{ auth.getUser()?.name }}</span>
              <div class="action-box">
                <button mat-button (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  Salir
                </button>
              </div>
            </ng-container>
            <ng-template #notLogged>
              <div class="action-box">
                <button mat-button (click)="openAdminLogin()">
                  <mat-icon>admin_panel_settings</mat-icon>
                  Ingresar
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </mat-toolbar-row>
    </mat-toolbar>
    <div class="content-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
    }
    .app-title {
      font-size: 1.5rem;
      font-weight: 500;
    }
    .menu-icon {
      cursor: pointer;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }
    .actions-section {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .user-name {
      font-size: 1.1rem;
      color: white;
      margin-right: 8px;
    }
    .action-box {
      // background-color: #ff9800;
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
    }
    mat-toolbar {
      position: static;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
    }
    .content-wrapper {
      padding-top: 0;
    }
  `]
})
export class AppComponent implements OnInit {
  isLogin = false;

  constructor(public auth: AuthService, private router: Router, private sidebarService: SidebarService) {}

  ngOnInit() {
    this.updateLoginStatus();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateLoginStatus();
    });
  }

  updateLoginStatus() {
    this.isLogin = this.router.url === '/admin-login';
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  openAdminLogin() {
    // Navigate to admin login page
    this.router.navigate(['/admin-login']);
  }

  goHome() {
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
  }

  goNotifications() {
    // TODO: Navigate to notifications page
    this.router.navigate(['/alerts']);
  }

  goProfile() {
    const user = this.auth.getUser();
    if (user && user.roles.includes('PATIENT')) {
      this.router.navigate(['/patient-profile']);
    } else {
      // For nurses and admins, perhaps navigate to home or a profile page
      this.goHome();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
