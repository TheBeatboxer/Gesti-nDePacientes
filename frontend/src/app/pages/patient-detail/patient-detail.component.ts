import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { VitalService } from '../../services/vital.service';
import { AuthService } from '../../services/auth.service';
import { NurseService } from '../../services/nurse.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ChatComponent } from '../../shared/chat/chat.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule, RouterModule, MatSnackBarModule, ChatComponent],
  template: `
    <div class="page-wrapper">
      <div class="patient-detail-container">
        <button mat-raised-button color="primary" routerLink="/patients">
          <mat-icon>arrow_back</mat-icon>
          Volver a Pacientes
        </button>

        <div class="section profile-section">
          <mat-card *ngIf="patient" class="patient-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ patient.name }}</mat-card-title>
            <mat-card-subtitle>{{ calculateAge(patient.birthDate) }} años</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Resumen Clínico:</strong> {{ patient.clinicalSummary }}</p>
            <p><strong>Tipo de Alta:</strong> {{ patient.dischargeType }}</p>
            <p><strong>Enfermeros Asignados:</strong> {{ getAssignedNurses() }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="section vitals-section">
        <mat-card class="vitals-card">
          <mat-card-header>
            <mat-card-title>Historial de Signos Vitales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="vitals-grid" *ngIf="vitals.length > 0; else noVitals">
              <mat-card *ngFor="let vital of vitals" class="vital-card" [ngClass]="getVitalClass(vital.type)">
                <mat-card-content>
                  <div class="vital-header">
                    <mat-icon class="vital-icon">{{ getVitalIcon(vital.type) }}</mat-icon>
                    <span class="vital-type">{{ getVitalLabel(vital.type) }}</span>
                  </div>
                  <div class="vital-value">
                    {{ getVitalDisplayValue(vital) }}
                  </div>
                  <div class="vital-timestamp">
                    {{ vital.timestamp | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <ng-template #noVitals>
              <p class="no-vitals">No hay registros de signos vitales.</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card class="add-vital-card">
          <mat-card-header>
            <mat-card-title>Agregar Signos Vitales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form #vitalForm="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Presión arterial (sistólica)</mat-label>
                <input matInput name="systolic" type="number" [(ngModel)]="newVital.systolic" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Presión arterial (diastólica)</mat-label>
                <input matInput name="diastolic" type="number" [(ngModel)]="newVital.diastolic" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Temperatura (°C)</mat-label>
                <input matInput name="temperature" type="number" step="0.1" [(ngModel)]="newVital.temperature" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Frecuencia cardíaca (lpm)</mat-label>
                <input matInput name="heartRate" type="number" [(ngModel)]="newVital.heartRate" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Glucosa (mg/dL)</mat-label>
                <input matInput name="glucose" type="number" [(ngModel)]="newVital.glucose" required>
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="saveVital()" [disabled]="!vitalForm.form.valid">Guardar Signos Vitales</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="section history-section">
        <mat-card class="history-card">
          <mat-card-header>
            <mat-card-title>Historial de Evolución</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let entry of patient?.history">
                <mat-icon mat-list-icon>note</mat-icon>
                <h4 mat-line>{{ entry.note }}</h4>
                <p mat-line>{{ entry.date | date:'dd/MM/yyyy HH:mm' }} - {{ entry.nurse?.name || 'Enfermero' }}</p>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="add-note-card">
          <mat-card-header>
            <mat-card-title>Agregar Nota de Evolución</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nota</mat-label>
              <textarea matInput [(ngModel)]="newNote" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Enfermero</mat-label>
              <mat-select [(ngModel)]="selectedNurse">
                <mat-option *ngFor="let nurse of nurses" [value]="nurse._id">{{ nurse.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="addNote()" [disabled]="!newNote || !selectedNurse">Agregar Nota</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="section chat-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Chat con {{ patient?.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chat [recipientId]="patient?.userId"></app-chat>
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
    }
    @media (min-width: 768px) {
      .page-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 20px;
        max-width: 1200px;
      }
      .profile-section {
        grid-column: 1;
        grid-row: 1;
      }
      .vitals-section {
        grid-column: 2;
        grid-row: 1;
      }
      .history-section {
        grid-column: 1 / span 2;
        grid-row: 2;
      }
    }
    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .vital-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid #ccc;
    }
    .vital-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .vital-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .vital-icon {
      margin-right: 8px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .vital-type {
      font-weight: 500;
      font-size: 14px;
      color: #666;
    }
    .vital-value {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .vital-timestamp {
      font-size: 12px;
      color: #999;
    }
    .vital-pressure {
      border-left-color: #1976d2;
    }
    .vital-pressure .vital-icon {
      color: #1976d2;
    }
    .vital-temp {
      border-left-color: #ff9800;
    }
    .vital-temp .vital-icon {
      color: #ff9800;
    }
    .vital-heart-rate {
      border-left-color: #4caf50;
    }
    .vital-heart-rate .vital-icon {
      color: #4caf50;
    }
    .vital-glucose {
      border-left-color: #9c27b0;
    }
    .vital-glucose .vital-icon {
      color: #9c27b0;
    }
    .no-vitals {
      text-align: center;
      color: #999;
      font-style: italic;
    }
    button {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: any;
  vitals: any[] = [];
  nurses: any[] = [];
  newNote = '';
  selectedNurse = '';
  newVital = {
    systolic: null,
    diastolic: null,
    temperature: null,
    heartRate: null,
    glucose: null
  };

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private vitalService: VitalService,
    private nurseService: NurseService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientService.getPatient(id).subscribe(data => {
        this.patient = data;
      });
      this.vitalService.getVitals(id).subscribe(data => {
        this.vitals = data;
      });
    }
    this.loadNurses();
    // Connect to chat when component initializes
    this.connectToChat();
  }

  connectToChat() {
    this.chatService.connect();
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(data => this.nurses = data);
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getAssignedNurses(): string {
    if (!this.patient?.assignedNurses) return 'Ninguno';
    return this.patient.assignedNurses.map((n: any) => n.name).join(', ');
  }

  getVitalClass(type: string): string {
    switch (type) {
      case 'pressure': return 'vital-pressure';
      case 'temp': return 'vital-temp';
      case 'heartRate': return 'vital-heart-rate';
      case 'glucose': return 'vital-glucose';
      default: return '';
    }
  }

  getVitalIcon(type: string): string {
    switch (type) {
      case 'pressure': return 'favorite';
      case 'temp': return 'thermostat';
      case 'heartRate': return 'monitor_heart';
      case 'glucose': return 'bloodtype';
      default: return 'monitor_heart';
    }
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

  addNote() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.newNote && this.selectedNurse) {
      this.patientService.addHistoryNote(id, this.newNote, this.selectedNurse).subscribe(() => {
        this.snackBar.open('Nota agregada exitosamente', 'Cerrar', { duration: 3000 });
        this.newNote = '';
        this.selectedNurse = '';
        // Reload patient to show new history
        this.patientService.getPatient(id).subscribe(data => this.patient = data);
      });
    }
  }

  saveVital() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBar.open('Paciente no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }
    const vitals = [
      { type: 'pressure', value: { systolic: this.newVital.systolic, diastolic: this.newVital.diastolic }, unit: 'mmHg' },
      { type: 'temp', value: this.newVital.temperature, unit: '°C' },
      { type: 'heartRate', value: this.newVital.heartRate, unit: 'lpm' },
      { type: 'glucose', value: this.newVital.glucose, unit: 'mg/dL' }
    ];

    let savedCount = 0;
    let hasError = false;

    vitals.forEach(vital => {
      this.vitalService.addVital(vital).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === vitals.length && !hasError) {
            this.snackBar.open('Signos vitales guardados exitosamente', 'Cerrar', { duration: 3000 });
            this.vitalService.getVitals(id).subscribe(data => this.vitals = data);
            this.newVital = { systolic: null, diastolic: null, temperature: null, heartRate: null, glucose: null };
          }
        },
        error: () => {
          if (!hasError) {
            hasError = true;
            this.snackBar.open('Error al guardar los registros vitales', 'Cerrar', { duration: 3000 });
          }
        }
      });
    });
  }
}
