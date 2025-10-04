import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { VitalService } from '../../services/vital.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  template: `
    <div class="profile-container">
      <h1>Mi Perfil de Paciente</h1>

      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Información Personal</mat-card-title>
          <mat-icon mat-card-avatar>person</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <form class="profile-form">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput [(ngModel)]="patient.name" name="name" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>DNI</mat-label>
              <input matInput [(ngModel)]="patient.dni" name="dni" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha de Nacimiento</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="patient.birthDate" name="birthDate" readonly>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput [(ngModel)]="patient.contact.phone" name="phone">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Dirección</mat-label>
              <textarea matInput [(ngModel)]="patient.contact.address" name="address" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Resumen Clínico</mat-label>
              <textarea matInput [(ngModel)]="patient.clinicalSummary" name="clinicalSummary" rows="4" readonly></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Alta</mat-label>
              <mat-select [(ngModel)]="patient.dischargeType" name="dischargeType" disabled>
                <mat-option value="post-operatorio">Post-operatorio</mat-option>
                <mat-option value="crónico compensado">Crónico Compensado</mat-option>
                <mat-option value="rehabilitación">Rehabilitación</mat-option>
              </mat-select>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="saveProfile()">
            <mat-icon>save</mat-icon>
            Guardar Cambios
          </button>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Cerrar Sesión
          </button>
        </mat-card-actions>
      </mat-card>

      <h2>REGISTRO DE SIGNOS VITALES</h2>
      <mat-card class="vital-card">
        <mat-card-content>
          <form [formGroup]="vitalForm" class="vital-form">
            <mat-form-field appearance="outline">
              <mat-label>Presión arterial (sistólica / diastólica)</mat-label>
              <div class="pressure-inputs">
                <input matInput formControlName="systolic" placeholder="120" type="number">
                <span>/</span>
                <input matInput formControlName="diastolic" placeholder="80" type="number">
                <span>mmHg</span>
              </div>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Temperatura</mat-label>
              <input matInput formControlName="temperature" placeholder="36.5" type="number" step="0.1">
              <span matSuffix>°C</span>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Frecuencia cardíaca</mat-label>
              <input matInput formControlName="heartRate" placeholder="70" type="number">
              <span matSuffix>lpm</span>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Glucosa</mat-label>
              <input matInput formControlName="glucose" placeholder="90" type="number">
              <span matSuffix>mg/dL</span>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [disabled]="vitalForm.invalid" (click)="saveVital()">
            <mat-icon>save</mat-icon>
            Guardar Registro
          </button>
        </mat-card-actions>
      </mat-card>

      <h2>HISTORIAL PERSONAL DE EVOLUCIÓN</h2>
      <mat-card class="history-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Tipo de signo vital</mat-label>
              <mat-select [(ngModel)]="filters.type">
                <mat-option value="">Todos</mat-option>
                <mat-option value="pressure">Presión arterial</mat-option>
                <mat-option value="temp">Temperatura</mat-option>
                <mat-option value="heartRate">Frecuencia cardíaca</mat-option>
                <mat-option value="glucose">Glucosa</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha inicio</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="filters.startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha fin</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="filters.endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <button mat-raised-button (click)="applyFilters()">Filtrar</button>
          </div>
          <div class="charts-container">
            <div class="chart-item">
              <h3>Presión Arterial</h3>
              <canvas baseChart [data]="pressureChart" [options]="chartOptions" type="line"></canvas>
            </div>
            <div class="chart-item">
              <h3>Temperatura</h3>
              <canvas baseChart [data]="tempChart" [options]="chartOptions" type="line"></canvas>
            </div>
            <div class="chart-item">
              <h3>Frecuencia Cardíaca</h3>
              <canvas baseChart [data]="heartRateChart" [options]="chartOptions" type="line"></canvas>
            </div>
            <div class="chart-item">
              <h3>Glucosa</h3>
              <canvas baseChart [data]="glucoseChart" [options]="chartOptions" type="line"></canvas>
            </div>
          </div>
          <div class="vital-list">
            <div *ngFor="let vital of vitals" class="vital-item">
              <span>{{ vital.recordedAt | date:'short' }} - {{ vital.type }}: 
                <span *ngIf="vital.type === 'pressure'">{{ vital.value.systolic }}/{{ vital.value.diastolic }} mmHg</span>
                <span *ngIf="vital.type !== 'pressure'">{{ vital.value }} {{ vital.unit }}</span>
              </span>
              <span class="indicator" [class.normal]="isNormal(vital.type, vital.value)" [class.abnormal]="!isNormal(vital.type, vital.value)">
                {{ isNormal(vital.type, vital.value) ? '✅' : '❌' }}
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .profile-container h1 {
      color: var(--medical-primary);
      text-align: center;
      margin-bottom: 30px;
    }
    .profile-card {
      padding: 20px;
    }
    .profile-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .profile-form mat-form-field {
      width: 100%;
    }
    .profile-form textarea {
      resize: vertical;
    }
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }
    @media (max-width: 768px) {
      .profile-form {
        grid-template-columns: 1fr;
      }
    }
    .vital-card, .history-card {
      margin-top: 20px;
      padding: 20px;
    }
    .vital-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .pressure-inputs {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .pressure-inputs input {
      width: 60px;
    }
    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .chart-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .chart-item h3 {
      margin-top: 0;
      color: var(--medical-primary);
      text-align: center;
    }
    .chart-item canvas {
      max-height: 200px;
    }
    .vital-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .vital-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .indicator.normal {
      color: green;
    }
    .indicator.abnormal {
      color: red;
    }
    h2 {
      color: var(--medical-primary);
      margin-top: 40px;
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  patient: any = {
    name: '',
    dni: '',
    birthDate: null,
    contact: { phone: '', address: '' },
    clinicalSummary: '',
    dischargeType: ''
  };

  vitalForm: FormGroup;
  vitals: any[] = [];
  filters: any = { type: '', startDate: '', endDate: '' };

  pressureChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  tempChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  heartRateChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  glucoseChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Tendencias de Signos Vitales' }
    }
  };

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private vitalService: VitalService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.vitalForm = this.fb.group({
      systolic: ['', Validators.required],
      diastolic: ['', Validators.required],
      temperature: ['', Validators.required],
      heartRate: ['', Validators.required],
      glucose: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadPatientProfile();
    this.loadVitals();
  }

  loadPatientProfile() {
    const user = this.authService.getUser();
    if (user && user.roles.includes('PATIENT')) {
      this.patientService.getMyPatient().subscribe({
        next: (patient) => {
          this.patient = patient;
        },
        error: (err) => {
          this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  saveProfile() {
    // Update contact info
    this.patientService.updatePatient(this.patient._id, { contact: this.patient.contact }).subscribe({
      next: () => {
        this.snackBar.open('Perfil guardado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar perfil', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveVital() {
    if (this.vitalForm.valid) {
      const formValue = this.vitalForm.value;
      const vitals = [
        { type: 'pressure', value: { systolic: +formValue.systolic, diastolic: +formValue.diastolic }, unit: 'mmHg' },
        { type: 'temp', value: +formValue.temperature, unit: '°C' },
        { type: 'heartRate', value: +formValue.heartRate, unit: 'lpm' },
        { type: 'glucose', value: +formValue.glucose, unit: 'mg/dL' }
      ];

      // Save each vital
      vitals.forEach(vital => {
        this.vitalService.addVitalSelf(vital).subscribe({
          next: () => {
            this.snackBar.open('Signos vitales guardados', 'Cerrar', { duration: 3000 });
            this.loadVitals();
            this.vitalForm.reset();
          },
          error: () => {
            this.snackBar.open('Error al guardar signos vitales', 'Cerrar', { duration: 3000 });
          }
        });
      });
    }
  }

  loadVitals() {
    this.patientService.getMyPatient().subscribe({
      next: (patient) => {
        this.vitalService.getVitalsForPatient(patient._id, this.filters).subscribe({
          next: (vitals) => {
            this.vitals = vitals;
            this.processChartData(vitals);
          },
          error: () => {
            this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  processChartData(vitals: any[]) {
    const pressureData = vitals.filter(v => v.type === 'pressure').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const tempData = vitals.filter(v => v.type === 'temp').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const heartRateData = vitals.filter(v => v.type === 'heartRate').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const glucoseData = vitals.filter(v => v.type === 'glucose').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    this.pressureChart = {
      labels: pressureData.map(v => new Date(v.recordedAt).toLocaleDateString()),
      datasets: [
        {
          data: pressureData.map(v => v.value.systolic),
          label: 'Sistólica',
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)'
        },
        {
          data: pressureData.map(v => v.value.diastolic),
          label: 'Diastólica',
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)'
        }
      ]
    };

    this.tempChart = {
      labels: tempData.map(v => new Date(v.recordedAt).toLocaleDateString()),
      datasets: [{
        data: tempData.map(v => v.value),
        label: 'Temperatura (°C)',
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.1)'
      }]
    };

    this.heartRateChart = {
      labels: heartRateData.map(v => new Date(v.recordedAt).toLocaleDateString()),
      datasets: [{
        data: heartRateData.map(v => v.value),
        label: 'Frecuencia Cardíaca (lpm)',
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.1)'
      }]
    };

    this.glucoseChart = {
      labels: glucoseData.map(v => new Date(v.recordedAt).toLocaleDateString()),
      datasets: [{
        data: glucoseData.map(v => v.value),
        label: 'Glucosa (mg/dL)',
        borderColor: 'purple',
        backgroundColor: 'rgba(128,0,128,0.1)'
      }]
    };
  }

  applyFilters() {
    this.loadVitals();
  }

  isNormal(type: string, value: any): boolean {
    if (type === 'temp') return value >= 36.5 && value <= 37.5;
    if (type === 'glucose') return value >= 70 && value <= 140;
    if (type === 'heartRate') return value >= 60 && value <= 100;
    if (type === 'pressure') return value.systolic >= 90 && value.systolic <= 120 && value.diastolic >= 60 && value.diastolic <= 80;
    return true;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
