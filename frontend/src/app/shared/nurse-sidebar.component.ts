import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nurse-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatIconModule],
  template: `
    <mat-sidenav-container class="nurse-layout">
      <mat-sidenav mode="side" opened class="sidebar">
        <h3>Menú Enfermero</h3>
        <mat-nav-list>
          <a mat-list-item routerLink="/nurse-dashboard">
            <mat-icon mat-list-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/patients">
            <mat-icon mat-list-icon>people</mat-icon>
            <span>Mis Pacientes</span>
          </a>
          <a mat-list-item routerLink="/reports">
            <mat-icon mat-list-icon>bar_chart</mat-icon>
            <span>Reportes</span>
          </a>
          <a mat-list-item routerLink="/appointments" *ngIf="isNurse">
            <mat-icon mat-list-icon>event</mat-icon>
            <span>Citas</span>
          </a>
          <a mat-list-item (click)="logout()">
            <mat-icon mat-list-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .nurse-layout {
      min-height: 100vh;
      background-color: var(--medical-background);
    }
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--medical-primary) 0%, var(--medical-secondary) 100%);
      color: white;
      padding: 20px;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }
    .sidebar h3 {
      margin-top: 0;
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 20px;
    }
    .sidebar .mat-nav-list {
      padding: 0;
    }
    .sidebar .mat-list-item {
      margin-bottom: 10px;
      border-radius: 8px;
      transition: background-color 0.3s;
    }
    .sidebar .mat-list-item:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .sidebar .mat-list-item .mat-icon {
      color: white;
    }
    .content {
      padding: 30px;
      overflow-y: auto;
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
      }
      .nurse-layout {
        flex-direction: column;
      }
      .content {
        padding: 20px;
      }
    }
  `]
})
export class NurseSidebarComponent implements OnInit {
  isNurse = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isNurse = this.authService.hasRole('NURSE');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
