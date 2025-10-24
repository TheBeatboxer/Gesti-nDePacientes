import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { VitalService } from '../../services/vital.service';
import { AlertService } from '../../services/alert.service';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule, MatChipsModule, MatSidenavModule, BaseChartDirective],
  template: `
    <mat-sidenav-container class="dashboard-container">
      <mat-sidenav mode="side" opened class="sidebar">
        <h3>Menú</h3>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon mat-list-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/patients">
            <mat-icon mat-list-icon>people</mat-icon>
            <span>Pacientes</span>
          </a>
          <a mat-list-item routerLink="/nurses">
            <mat-icon mat-list-icon>local_hospital</mat-icon>
            <span>Enfermeros</span>
          </a>
          <a mat-list-item routerLink="/reports">
            <mat-icon mat-list-icon>bar_chart</mat-icon>
            <span>Reportes</span>
          </a>
          <a mat-list-item routerLink="/appointments">
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
        <h1>Dashboard Médico</h1>

        <div class="cards-grid">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Pacientes Totales</mat-card-title>
            <mat-icon mat-card-avatar>people</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ patients.length }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Alertas Activas</mat-card-title>
            <mat-icon mat-card-avatar>warning</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ alerts.length }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Signos Vitales Hoy</mat-card-title>
            <mat-icon mat-card-avatar>monitor_heart</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ vitals.length }}</h2>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="alerts-card">
          <mat-card-header>
            <mat-card-title>Alertas Activas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let alert of alerts">
                <mat-icon mat-list-icon [style.color]="getPriorityColor(alert.priority)">warning</mat-icon>
                <h4 mat-line>{{ alert.message }}</h4>
                <p mat-line>Prioridad: {{ alert.priority }}</p>
                <mat-chip-listbox>
                  <mat-chip>{{ alert.patient?.name }}</mat-chip>
                </mat-chip-listbox>
                <button mat-icon-button (click)="resolve(alert._id)">
                  <mat-icon>check</mat-icon>
                </button>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="patients-card">
          <mat-card-header>
            <mat-card-title>Pacientes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let patient of patients" [routerLink]="['/patient', patient._id]">
                <mat-icon mat-list-icon>person</mat-icon>
                <h4 mat-line>{{ patient.name }}</h4>
                <p mat-line>{{ patient.condition }}</p>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="vitals-card">
          <mat-card-header>
            <mat-card-title>Signos Vitales Recientes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="vitalsChartData"
              [options]="vitalsChartOptions"
              [type]="vitalsChartType">
            </canvas>
          </mat-card-content>
        </mat-card>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
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
    .vitals-card canvas {
      max-height: 300px;
      border-radius: 8px;
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
      }
      .dashboard-container {
        flex-direction: column;
      }
      .content-grid {
        grid-template-columns: 1fr;
      }
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  vitals: any[] = [];
  alerts: any[] = [];
  patients: any[] = [];

  vitalsChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Signos Vitales',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  vitalsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  vitalsChartType: ChartType = 'line';

  constructor(
    private vitalService: VitalService,
    private alertService: AlertService,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVitals();
    this.loadAlerts();
    this.loadPatients();
  }

  loadVitals() {
    this.vitalService.getVitals().subscribe(data => {
      this.vitals = data;
      this.updateChart();
    });
  }

  loadAlerts() {
    this.alertService.getAlerts().subscribe(data => this.alerts = data.filter(a => !a.resolved));
  }

  loadPatients() {
    this.patientService.getPatients().subscribe(data => this.patients = data);
  }

  resolve(id: string) {
    this.alertService.resolveAlert(id).subscribe(() => this.loadAlerts());
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  }

  updateChart() {
    const labels = this.vitals.map(v => new Date(v.timestamp).toLocaleTimeString());
    const data = this.vitals.map(v => v.value);
    this.vitalsChartData = {
      labels,
      datasets: [{
        data,
        label: 'Valor',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
