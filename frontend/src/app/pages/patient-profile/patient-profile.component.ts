import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, ChartData, registerables } from 'chart.js';
import { ChatComponent } from '../../shared/chat/chat.component';

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
    MatSelectModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    BaseChartDirective,
    ChatComponent
  ],
  template: `
    <div class="page-wrapper" *ngIf="!isNurse">
      <h1>Mi Perfil de Paciente</h1>

      <div class="section profile-section">
        <h2>INFORMACIÓN PERSONAL</h2>
        <mat-card class="profile-card">
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
              <input matInput [(ngModel)]="patient.contact.phone" name="phone" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Dirección</mat-label>
              <textarea matInput [(ngModel)]="patient.contact.address" name="address" rows="3" readonly></textarea>
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

        </mat-card>
      </div>

      <div class="section vitals-section">
        <h2>REGISTRO DE SIGNOS VITALES</h2>
      <mat-card class="vital-card">
        <mat-card-content>
          <form [formGroup]="vitalForm" class="vital-form">
            <div class="pressure-field">
              <mat-label class="pressure-label">Presión arterial (sistólica / diastólica)</mat-label>
              <div class="pressure-inputs">
                <mat-form-field appearance="outline" class="pressure-systolic">
                  <mat-label>Sistólica</mat-label>
                  <input matInput formControlName="systolic" placeholder="120" type="number">
                </mat-form-field>
                <span class="pressure-separator">/</span>
                <mat-form-field appearance="outline" class="pressure-diastolic">
                  <mat-label>Diastólica</mat-label>
                  <input matInput formControlName="diastolic" placeholder="80" type="number">
                </mat-form-field>
                <span class="pressure-unit">mmHg</span>
              </div>
            </div>
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
            <mat-form-field appearance="outline">
              <mat-label>Notas (opcional)</mat-label>
              <textarea matInput formControlName="notes" rows="2" placeholder="Notas adicionales"></textarea>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button class="doctor-btn" [disabled]="vitalForm.invalid" (click)="saveVital()">
            <mat-icon>save</mat-icon>
            Guardar Registro
          </button>
        </mat-card-actions>
        </mat-card>
      </div>

      <div class="section history-section">
        <h2>HISTORIAL PERSONAL DE EVOLUCIÓN</h2>
      <mat-card class="history-card">
        <mat-card-content>
          <div class="filters">
            <div class="quick-filters">
              <button mat-button [class.active]="activeFilter === 'today'" (click)="setFilter('today')">Hoy</button>
              <button mat-button [class.active]="activeFilter === '7days'" (click)="setFilter('7days')">7 días</button>
              <button mat-button [class.active]="activeFilter === '30days'" (click)="setFilter('30days')">30 días</button>
              <button mat-button [class.active]="activeFilter === 'custom'" (click)="setFilter('custom')">Personalizado</button>
            </div>
            <div *ngIf="activeFilter === 'custom'" class="custom-dates">
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
              <button mat-raised-button (click)="applyFilters()">Aplicar</button>
            </div>
          </div>
          <div class="charts-container">
            <div class="chart-item">
              <h3>Presión Arterial (mmHg)</h3>
              <canvas baseChart [data]="pressureChart" [options]="pressureChartOptions" type="line" (chartClick)="onChartClick($event, 'pressure')"></canvas>
            </div>
            <div class="chart-item">
              <h3>Temperatura (°C)</h3>
              <canvas baseChart [data]="tempChart" [options]="tempChartOptions" type="line" (chartClick)="onChartClick($event, 'temp')"></canvas>
            </div>
            <div class="chart-item">
              <h3>Frecuencia Cardíaca (lpm)</h3>
              <canvas baseChart [data]="heartRateChart" [options]="heartRateChartOptions" type="line" (chartClick)="onChartClick($event, 'heartRate')"></canvas>
            </div>
            <div class="chart-item">
              <h3>Glucosa (mg/dL)</h3>
              <canvas baseChart [data]="glucoseChart" [options]="glucoseChartOptions" type="line" (chartClick)="onChartClick($event, 'glucose')"></canvas>
            </div>
          </div>

          </mat-card-content>
        </mat-card>
        </div>

        <div class="section medical-history-section">
          <h2>HISTORIAL MÉDICO</h2>
          <mat-card class="medical-history-card">
            <mat-card-content>
              <div class="filters">
                <div class="quick-filters">
                  <button mat-button [class.active]="activeFilter === 'today'" (click)="setFilter('today')">Hoy</button>
                  <button mat-button [class.active]="activeFilter === '7days'" (click)="setFilter('7days')">7 días</button>
                  <button mat-button [class.active]="activeFilter === '30days'" (click)="setFilter('30days')">30 días</button>
                  <button mat-button [class.active]="activeFilter === 'custom'" (click)="setFilter('custom')">Personalizado</button>
                </div>
                <div *ngIf="activeFilter === 'custom'" class="custom-dates">
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
                  <button mat-raised-button (click)="applyFilters()">Aplicar</button>
                </div>
              </div>
              <div class="table-container">
                <table mat-table [dataSource]="groupedVitals" class="vitals-table">
                <!-- Fecha Column -->
                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef> Fecha </th>
                  <td mat-cell *matCellDef="let element"> {{ element.fecha | date:'dd/MM/yyyy HH:mm' }} </td>
                </ng-container>
                <!-- Presión Arterial Column -->
                <ng-container matColumnDef="presion">
                  <th mat-header-cell *matHeaderCellDef> Presión Arterial </th>
                  <td mat-cell *matCellDef="let element"> {{ element.presion || '-' }} </td>
                </ng-container>
                <!-- Temperatura Column -->
                <ng-container matColumnDef="temperatura">
                  <th mat-header-cell *matHeaderCellDef> Temperatura </th>
                  <td mat-cell *matCellDef="let element"> {{ element.temperatura || '-' }} </td>
                </ng-container>
                <!-- Frecuencia Cardíaca Column -->
                <ng-container matColumnDef="frecuencia">
                  <th mat-header-cell *matHeaderCellDef> Frecuencia Cardíaca </th>
                  <td mat-cell *matCellDef="let element"> {{ element.frecuencia || '-' }} </td>
                </ng-container>
                <!-- Glucosa Column -->
                <ng-container matColumnDef="glucosa">
                  <th mat-header-cell *matHeaderCellDef> Glucosa </th>
                  <td mat-cell *matCellDef="let element"> {{ element.glucosa || '-' }} </td>
                </ng-container>
                <!-- Estado Column -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef> Estado </th>
                  <td mat-cell *matCellDef="let element">
                    <span [class]="element.estado === '✅' ? 'normal' : 'abnormal'">
                      {{ element.estado }}
                    </span>
                  </td>
                </ng-container>
                <!-- Notas Column -->
                <ng-container matColumnDef="notas">
                  <th mat-header-cell *matHeaderCellDef> Notas </th>
                  <td mat-cell *matCellDef="let element"> {{ element.notas }} </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section education-section">
          <h2>BIBLIOTECA DE AUTOCUIDADO</h2>
          <mat-card class="education-card">
            <mat-card-content>
              <div class="education-content">
                <div class="education-info">
                  <mat-icon class="education-icon">school</mat-icon>
                  <div class="education-text">
                    <h3>Aprende sobre tu salud</h3>
                    <p>Accede a videos educativos sobre autocuidado, medicamentos, ejercicios y más.</p>
                  </div>
                </div>
                <button mat-raised-button color="primary" class="education-btn" (click)="goToEducation()">
                  <mat-icon>play_circle_outline</mat-icon>
                  Ver Videos Educativos
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section appointments-section">
          <h2>GESTIÓN DE CITAS</h2>
          <mat-card class="appointments-card">
            <mat-card-content>
              <div class="appointments-content">
                <div class="appointments-info">
                  <mat-icon class="appointments-icon">event</mat-icon>
                  <div class="appointments-text">
                    <h3>Gestiona tus citas médicas</h3>
                    <p>Programa, modifica o cancela tus citas con médicos y enfermeras.</p>
                  </div>
                </div>
                <button mat-raised-button class="appointments-btn" (click)="goToAppointments()">
                  <mat-icon>calendar_today</mat-icon>
                  Ver Mis Citas
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section chat-section">
          <h2>CHAT CON ENFERMERAS</h2>
          <mat-card class="chat-card">
            <mat-card-content>
              <div *ngIf="patient.assignedNurses && patient.assignedNurses.length > 0; else noNurses">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Chatear con...</mat-label>
                  <mat-select [(ngModel)]="selectedNurseId" (selectionChange)="onNurseSelected()">
                    <mat-option *ngFor="let nurse of patient.assignedNurses" [value]="nurse._id">
                      {{ nurse.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <app-chat *ngIf="selectedNurseId" [recipientId]="selectedNurseId"></app-chat>
              </div>
              <ng-template #noNurses>
                <p>No tienes enfermeras asignadas para chatear en este momento.</p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>

      </div>
  `,
  styles: [`
    .page-wrapper {
      padding: 20px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .section {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 768px) {
      .page-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto auto auto auto;
        gap: 20px;
        align-items: stretch;
        max-width: 1400px;
      }
      h1 {
        grid-column: 1 / span 2;
        grid-row: 1;
      }
      .profile-section {
        grid-column: 1;
        grid-row: 2;
      }
      .vitals-section {
        grid-column: 2;
        grid-row: 2;
      }
      .history-section {
        grid-column: 1 / span 2;
        grid-row: 3;
      }
      .medical-history-section {
        grid-column: 1 / span 2;
        grid-row: 4;
      }
      .education-section {
        grid-column: 1;
        grid-row: 5;
      }
      .appointments-section {
        grid-column: 2;
        grid-row: 5;
      }
      .chat-section {
        grid-column: 1 / span 2;
        grid-row: 6;
      }
      .vitals-section {
        grid-column: 2;
        grid-row: 2;
      }
      .section {
        margin-bottom: 0;
      }
    }
    h1 {
      color: var(--medical-primary);
      text-align: center;
      margin-bottom: 30px;
    }
    .profile-card, .vital-card, .history-card, .medical-history-card, .chat-card, .education-card, .appointments-card {
      padding: 20px;
      flex: 1;
      box-sizing: border-box;
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

    .vital-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .pressure-field {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pressure-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 500;
      margin-bottom: 4px;
    }

    .pressure-inputs {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }

    .pressure-systolic,
    .pressure-diastolic {
      flex: 1;
      min-width: 120px;
    }

    .pressure-separator {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--medical-primary);
      margin: 0 8px;
      align-self: center;
    }

    .pressure-unit {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 500;
      align-self: center;
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .pressure-inputs {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .pressure-systolic,
      .pressure-diastolic {
        min-width: auto;
      }

      .pressure-separator,
      .pressure-unit {
        align-self: center;
        margin: 0;
      }
    }
    .filters {
      margin-bottom: 20px;
    }
    .quick-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .quick-filters button {
      border: 1px solid #ddd;
      border-radius: 4px;
      white-space: nowrap;
      min-width: fit-content;
      flex-shrink: 0;
    }
    .quick-filters button.active {
      background-color: var(--medical-primary);
      color: white;
      border-color: var(--medical-primary);
    }
    .custom-dates {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    @media (max-width: 480px) {
      .quick-filters {
        gap: 6px;
        justify-content: flex-start;
      }
      .quick-filters button {
        font-size: 11px;
        padding: 6px 8px;
        min-width: auto;
        flex-shrink: 1;
      }
    }
    .charts-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin: 0 auto 20px;
      max-width: 800px;
    }
    .chart-item {
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .chart-item canvas {
      width: 100% !important;
      height: 250px !important;
    }
    .vitals-table, .medical-history-table {
      width: 100%;
      border-radius: 8px;
      overflow-x: auto;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      margin-top: 20px;
      min-width: 600px;
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }

    @media (max-width: 768px) {
      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    .vitals-table td.mat-cell, .medical-history-table td.mat-cell {
      padding: 16px 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .vitals-table tr.mat-row, .medical-history-table tr.mat-row {
      transition: background-color 0.2s ease;
    }
    .vitals-table tr.mat-row:hover, .medical-history-table tr.mat-row:hover {
      background-color: #f8f9fa;
      cursor: pointer;
    }
    .vitals-table tr.mat-row:nth-child(even), .medical-history-table tr.mat-row:nth-child(even) {
      background-color: #fafafa;
    }
    .normal {
      color: #4caf50;
      font-weight: 600;
    }
    .abnormal {
      color: #f44336;
      font-weight: 600;
    }
    h2 {
      color: var(--medical-primary);
      margin-top: 40px;
    }
    .doctor-btn {
      background: linear-gradient(45deg, #1976d2, #42a5f5);
      color: white;
      border: none;
    }
    .doctor-btn:hover {
      background: linear-gradient(45deg, #1565c0, #1976d2);
    }
    .doctor-btn:disabled {
      background: linear-gradient(45deg, #ccc, #ddd);
      color: #666;
      cursor: not-allowed;
    }
    .full-width {
      width: 100%;
    }

    .education-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .education-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .education-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--medical-primary);
    }

    .education-text h3 {
      margin: 0 0 5px 0;
      color: var(--medical-primary);
      font-size: 1.2rem;
    }

    .education-text p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .education-btn {
      background: linear-gradient(45deg, #4caf50, #66bb6a);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .education-btn:hover {
      background: linear-gradient(45deg, #388e3c, #4caf50);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .education-btn mat-icon {
      margin-right: 8px;
    }

    .appointments-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .appointments-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .appointments-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--medical-primary);
    }

    .appointments-text h3 {
      margin: 0 0 5px 0;
      color: var(--medical-primary);
      font-size: 1.2rem;
    }

    .appointments-text p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .appointments-btn {
      background: linear-gradient(45deg, #ff9800, #ffb74d);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .appointments-btn:hover {
      background: linear-gradient(45deg, #f57c00, #ff9800);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    .appointments-btn mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .education-content,
      .appointments-content {
        flex-direction: column;
        text-align: center;
      }

      .education-info,
      .appointments-info {
        flex-direction: column;
        text-align: center;
      }

      .education-btn,
      .appointments-btn {
        width: 100%;
      }
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  isNurse = false;

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
  filters: any = { startDate: '', endDate: '' };
  activeFilter: string = '30days';
  savingVitals: boolean = false;
  selectedNurseId?: string;

  pressureChart: ChartData<'line'> = { labels: [], datasets: [] };
  tempChart: ChartData<'line'> = { labels: [], datasets: [] };
  heartRateChart: ChartData<'line'> = { labels: [], datasets: [] };
  glucoseChart: ChartData<'line'> = { labels: [], datasets: [] };

  pressureTimeLabels: string[] = [];
  tempTimeLabels: string[] = [];
  heartRateTimeLabels: string[] = [];
  glucoseTimeLabels: string[] = [];

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  pressureChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const timeLabel = this.pressureTimeLabels[context.dataIndex];
            return `${context.dataset.label}: ${value} at ${timeLabel}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      }
    }
  };

  tempChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const timeLabel = this.tempTimeLabels[context.dataIndex];
            return `${value} at ${timeLabel}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      }
    }
  };

  heartRateChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const timeLabel = this.heartRateTimeLabels[context.dataIndex];
            return `${value} at ${timeLabel}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      }
    }
  };

  glucoseChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const timeLabel = this.glucoseTimeLabels[context.dataIndex];
            return `${value} at ${timeLabel}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      }
    }
  };

  displayedColumns: string[] = ['fecha', 'presion', 'temperatura', 'frecuencia', 'glucosa', 'estado', 'notas'];
  groupedVitals: any[] = [];

  medicalHistoryColumns: string[] = ['date', 'description'];
  medicalHistory: any[] = [];




  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private vitalService: VitalService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
    this.vitalForm = this.fb.group({
      systolic: ['', Validators.required],
      diastolic: ['', Validators.required],
      temperature: ['', Validators.required],
      heartRate: ['', Validators.required],
      glucose: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    const user = this.authService.getUser();
    this.isNurse = user.roles.includes('NURSE');
    this.loadPatientProfile();
  }

  loadPatientProfile() {
    const user = this.authService.getUser();
    if (user && user.roles.includes('PATIENT')) {
      this.patientService.getMyPatient().subscribe({
        next: (patient) => {
          this.patient = patient;
          // Load medical history from patient data
          this.medicalHistory = patient.history ? patient.history.map((h: any) => ({
            date: h.date,
            description: h.note
          })) : [];
          // Agregar datos dummy para enfermeras asignadas si no existen
          if (!this.patient.assignedNurses || this.patient.assignedNurses.length === 0) {
            this.patient.assignedNurses = [
              { _id: 'nurse1', name: 'Enfermera Ana' },
              { _id: 'nurse2', name: 'Enfermera María' }
            ];
          }
          // Now that we have the patient, set default filter and load vitals
          this.setFilter('30days');
          this.loadVitals();
        },
        error: (err) => {
          this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }



  saveVital() {
    if (this.vitalForm.valid) {
      this.savingVitals = true;
      const formValue = this.vitalForm.value;
      const vitals = [
        { type: 'pressure', value: { systolic: +formValue.systolic, diastolic: +formValue.diastolic }, unit: 'mmHg', notes: formValue.notes },
        { type: 'temp', value: +formValue.temperature, unit: '°C', notes: formValue.notes },
        { type: 'heartRate', value: +formValue.heartRate, unit: 'lpm', notes: formValue.notes },
        { type: 'glucose', value: +formValue.glucose, unit: 'mg/dL', notes: formValue.notes }
      ];

      let savedCount = 0;
      let hasError = false;

      vitals.forEach(vital => {
        this.vitalService.addVitalSelf(vital).subscribe({
          next: () => {
            savedCount++;
            if (savedCount === vitals.length && !hasError) {
              this.snackBar.open('Signos vitales guardados exitosamente', 'Cerrar', { duration: 3000 });
              this.loadVitals();
              this.vitalForm.reset();
              this.savingVitals = false;
            }
          },
          error: () => {
            if (!hasError) {
              hasError = true;
              this.snackBar.open('Error al guardar los registros vitales', 'Cerrar', { duration: 3000 });
              this.savingVitals = false;
            }
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
            this.groupVitals(vitals);
            this.processChartData(vitals);
            this.cdr.detectChanges();
            setTimeout(() => this.charts.forEach(chart => chart.update()), 0);
          },
          error: () => {
            this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  processChartData(vitals: any[]) {
    const isToday = this.activeFilter === 'today';
    const pressureData = vitals.filter(v => v.type === 'pressure').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const tempData = vitals.filter(v => v.type === 'temp').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const heartRateData = vitals.filter(v => v.type === 'heartRate').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const glucoseData = vitals.filter(v => v.type === 'glucose').sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatDateTime = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    this.pressureTimeLabels = pressureData.map(v => formatDateTime(new Date(v.recordedAt)));
    this.pressureChart = {
      labels: pressureData.map(v => isToday ? new Date(v.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : formatDate(new Date(v.recordedAt))),
      datasets: [
        {
          data: pressureData.map(v => +v.value.systolic),
          label: 'Sistólica',
          borderColor: '#1976d2',
          backgroundColor: '#1976d2',
          fill: false,
          tension: 0.4
        },
        {
          data: pressureData.map(v => +v.value.diastolic),
          label: 'Diastólica',
          borderColor: '#42a5f5',
          backgroundColor: '#42a5f5',
          fill: false,
          tension: 0.4
        }
      ]
    };

    this.tempTimeLabels = tempData.map(v => formatDateTime(new Date(v.recordedAt)));
    this.tempChart = {
      labels: tempData.map(v => isToday ? new Date(v.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : formatDate(new Date(v.recordedAt))),
      datasets: [{
        data: tempData.map(v => +v.value),
        label: 'Temperatura (°C)',
        borderColor: '#0d47a1',
        backgroundColor: '#0d47a1',
        fill: false,
        tension: 0.4
      }]
    };

    this.heartRateTimeLabels = heartRateData.map(v => formatDateTime(new Date(v.recordedAt)));
    this.heartRateChart = {
      labels: heartRateData.map(v => isToday ? new Date(v.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : formatDate(new Date(v.recordedAt))),
      datasets: [{
        data: heartRateData.map(v => +v.value),
        label: 'Frecuencia Cardíaca (lpm)',
        borderColor: '#1565c0',
        backgroundColor: '#1565c0',
        fill: false,
        tension: 0.4
      }]
    };

    this.glucoseTimeLabels = glucoseData.map(v => formatDateTime(new Date(v.recordedAt)));
    this.glucoseChart = {
      labels: glucoseData.map(v => isToday ? new Date(v.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : formatDate(new Date(v.recordedAt))),
      datasets: [{
        data: glucoseData.map(v => +v.value),
        label: 'Glucosa (mg/dL)',
        borderColor: '#9c27b0',
        backgroundColor: '#9c27b0',
        fill: false,
        tension: 0.4
      }]
    };
  }

  applyFilters() {
    this.loadVitals();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    const now = new Date();
    if (filter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      this.filters.startDate = start;
      this.filters.endDate = end;
    } else if (filter === '7days') {
      this.filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      this.filters.endDate = now;
    } else if (filter === '30days') {
      this.filters.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      this.filters.endDate = now;
    } else if (filter === 'custom') {
      // do nothing, wait for apply button
      return;
    }
    this.loadVitals(); // Reload vitals when a quick filter is clicked
  }

  onChartClick(event: any, type: string) {
    if (event.active && event.active.length > 0) {
      const index = event.active[0].index;
      const filteredVitals = this.vitals.filter(v => v.type === type).sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
      const vital = filteredVitals[index];
      if (vital) {
        const details = this.formatVitalDetails(vital);
        alert(details); // For testing
      }
    }
  }

  formatVitalDetails(vital: any): string {
    const date = new Date(vital.recordedAt).toLocaleString();
    let valueStr = '';
    if (vital.type === 'pressure') {
      valueStr = `${vital.value.systolic}/${vital.value.diastolic} mmHg`;
    } else {
      valueStr = `${vital.value} ${vital.unit}`;
    }
    const notes = vital.notes ? ` - Notas: ${vital.notes}` : '';
    return `${date} - ${vital.type}: ${valueStr}${notes}`;
  }

  isNormal(type: string, value: any): boolean {
    if (type === 'temp') return value >= 36.5 && value <= 37.5;
    if (type === 'glucose') return value >= 70 && value <= 140;
    if (type === 'heartRate') return value >= 60 && value <= 100;
    if (type === 'pressure') return value.systolic >= 90 && value.systolic <= 120 && value.diastolic >= 60 && value.diastolic <= 80;
    return true;
  }

  getVitalLabel(type: string): string {
    switch (type) {
      case 'pressure': return 'Presión Arterial';
      case 'temp': return 'Temperatura';
      case 'heartRate': return 'Frecuencia Cardíaca';
      case 'glucose': return 'Glucosa';
      default: return type;
    }
  }

  getVitalDisplayValue(vital: any): string {
    if (vital.type === 'pressure') {
      return `${vital.value.systolic}/${vital.value.diastolic} mmHg`;
    } else {
      return `${vital.value} ${vital.unit || ''}`;
    }
  }

  groupVitals(vitals: any[]) {
    const grouped = new Map();
    vitals.forEach(vital => {
      const date = new Date(vital.recordedAt).toISOString().slice(0, 16); // group by minute
      if (!grouped.has(date)) {
        grouped.set(date, {
          fecha: new Date(vital.recordedAt),
          presion: null,
          temperatura: null,
          frecuencia: null,
          glucosa: null,
          estado: '✅',
          notas: new Set()
        });
      }
      const group = grouped.get(date);
      if (vital.type === 'pressure') {
        group.presion = `${vital.value.systolic}/${vital.value.diastolic} mmHg`;
      } else if (vital.type === 'temp') {
        group.temperatura = `${vital.value} °C`;
      } else if (vital.type === 'heartRate') {
        group.frecuencia = `${vital.value} lpm`;
      } else if (vital.type === 'glucose') {
        group.glucosa = `${vital.value} mg/dL`;
      }
      if (!this.isNormal(vital.type, vital.value)) {
        group.estado = '❌';
      }
      if (vital.notes) {
        group.notas.add(vital.notes);
      }
    });
    this.groupedVitals = Array.from(grouped.values()).map(g => ({
      ...g,
      notas: Array.from(g.notas).join('; ') || '-'
    })).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  onNurseSelected() {
  }

  goToEducation() {
    this.router.navigate(['/patient-education']);
  }

  goToAppointments() {
    this.router.navigate(['/appointments']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
