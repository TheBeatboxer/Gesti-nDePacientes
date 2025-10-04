import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { PatientService } from '../../services/patient.service';
import { ChatService } from '../../services/chat.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule, MatDrawerMode } from '@angular/material/sidenav';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-nurse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule, MatChipsModule, MatSidenavModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <mat-sidenav-container class="dashboard-container">
      <mat-sidenav [mode]="mode" [opened]="sidenavOpened" class="sidebar">
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
          <a mat-list-item (click)="logout()">
            <mat-icon mat-list-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <h1>Dashboard Enfermero</h1>

        <div class="cards-grid">
        <mat-card class="summary-card" routerLink="/patients">
          <mat-card-header>
            <mat-card-title>Total de Pacientes Asignados</mat-card-title>
            <mat-icon mat-card-avatar>people</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ totalPatients }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card alert-card" routerLink="/patients">
          <mat-card-header>
            <mat-card-title>Pacientes con Alertas Activas</mat-card-title>
            <mat-icon mat-card-avatar>warning</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ activeAlertsPatients }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Mensajes No Leídos</mat-card-title>
            <mat-icon mat-card-avatar>message</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ unreadMessages }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Citas para Hoy</mat-card-title>
            <mat-icon mat-card-avatar>calendar_today</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ todaysAppointments }}</h2>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="patients-card">
          <mat-card-header>
            <mat-card-title>Mis Pacientes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let patient of patients" class="patient-list-item">
                <mat-icon mat-list-icon>person</mat-icon>
                <div mat-line class="patient-info">
                  <h4>{{ patient.name }}</h4>
                  <p>{{ patient.dischargeType }}</p>
                </div>
                <div class="patient-actions" *ngIf="isAdmin">
                  <button mat-icon-button color="warn" (click)="deletePatient($event, patient._id)" matTooltip="Eliminar paciente">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: var(--medical-background);
    }
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, var(--medical-primary) 0%, var(--medical-secondary) 100%);
      color: white;
      padding: 20px;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
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
      transition: all 0.3s ease;
    }
    .content h1 {
      color: var(--medical-primary);
      margin-bottom: 30px;
      text-align: center;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }
    .summary-card {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
      border-left: 5px solid var(--medical-primary);
      cursor: pointer;
      transition: transform 0.2s;
    }
    .summary-card:hover {
      transform: translateY(-5px);
    }
    .alert-card {
      border-left-color: orange;
      background: linear-gradient(135deg, #ffffff 0%, #fff3cd 100%);
    }
    .summary-card h2 {
      font-size: 2.5rem;
      color: var(--medical-primary);
      margin: 10px 0;
    }
    .summary-card mat-card-title {
      color: var(--medical-text-secondary);
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }
    .alerts-card, .patients-card, .vitals-card {
      height: fit-content;
      padding: 20px;
    }
    .alerts-card mat-list-item {
      margin-bottom: 10px;
      border-radius: 8px;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }
    .patients-card mat-list-item {
      margin-bottom: 10px;
      border-radius: 8px;
      background-color: #e8f5e8;
      border-left: 4px solid var(--medical-secondary);
    }
    .patient-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
    }
    .patient-info {
      flex: 1;
    }
    .patient-info h4 {
      margin: 0;
      font-size: 1rem;
      color: var(--medical-primary);
    }
    .patient-info p {
      margin: 4px 0 0 0;
      font-size: 0.9rem;
      color: var(--medical-text-secondary);
    }
    .patient-actions {
      display: flex;
      gap: 8px;
    }
    .vitals-card canvas {
      max-height: 300px;
      border-radius: 8px;
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 280px;
      }
      .content {
        padding: 20px;
      }
      .content-grid {
        grid-template-columns: 1fr;
      }
      .cards-grid {
        grid-template-columns: 1fr;
      }
      .content h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class NurseDashboardComponent implements OnInit, OnDestroy {
  patients: any[] = [];
  totalPatients: number = 0;
  activeAlertsPatients: number = 0;
  unreadMessages: number = 0;
  todaysAppointments: number = 0;
  sidenavOpened = true;
  mode: MatDrawerMode = 'side';
  isAdmin = false;
  private subscription: Subscription = new Subscription();



  constructor(
    private alertService: AlertService,
    private patientService: PatientService,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  ngOnInit() {
    this.loadPatients();
    this.loadActiveAlertsPatients();
    this.loadUnreadMessages();
    this.loadTodaysAppointments();
    this.updateMode();
    this.subscription.add(
      this.sidebarService.opened$.subscribe(opened => {
        this.sidenavOpened = opened;
      })
    );
    this.subscription.add(
      fromEvent(window, 'resize').subscribe(() => {
        this.updateMode();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateMode() {
    this.mode = window.innerWidth < 768 ? 'over' : 'side';
  }





  loadPatients() {
    this.patientService.getPatients().subscribe(data => {
      this.patients = data.items || data;
      this.totalPatients = data.total || data.length;
    });
  }

  loadActiveAlertsPatients() {
    this.alertService.getActiveAlertsPatientCount().subscribe(data => this.activeAlertsPatients = data.count);
  }

  loadUnreadMessages() {
    this.chatService.getUnreadCount().subscribe(data => this.unreadMessages = data.count);
  }

  loadTodaysAppointments() {
    this.patientService.getTodaysAppointments().subscribe(data => this.todaysAppointments = data.count);
  }







  deletePatient(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.snackBar.open('Paciente eliminado', 'Cerrar', { duration: 3000 });
          this.loadPatients();
        },
        error: (error) => {
          if (error.status === 403) {
            this.snackBar.open('No tienes permisos para eliminar pacientes. Solo administradores pueden hacerlo.', 'Cerrar', { duration: 5000 });
          } else {
            this.snackBar.open('Error al eliminar paciente', 'Cerrar', { duration: 3000 });
          }
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
