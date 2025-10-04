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

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule, RouterModule, MatSnackBarModule],
  template: `
    <div class="patient-detail-container">
      <button mat-raised-button color="primary" routerLink="/patients">
        <mat-icon>arrow_back</mat-icon>
        Volver a Pacientes
      </button>

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

      <mat-card class="history-card">
        <mat-card-header>
          <mat-card-title>Historial de Evolución</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let entry of patient?.history">
              <mat-icon mat-list-icon>note</mat-icon>
              <h4 mat-line>{{ entry.note }}</h4>
              <p mat-line>{{ entry.date | date:'medium' }} - {{ entry.nurse?.name || 'Enfermero' }}</p>
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

      <mat-card class="vitals-card">
        <mat-card-header>
          <mat-card-title>Historial de Signos Vitales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let vital of vitals">
              <mat-icon mat-list-icon>monitor_heart</mat-icon>
              <h4 mat-line>{{ vital.type }}: {{ vital.value }}</h4>
              <p mat-line>{{ vital.timestamp | date:'medium' }}</p>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .patient-detail-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .patient-card {
      margin-bottom: 20px;
    }
    .vitals-card {
      margin-top: 20px;
    }
    button {
      margin-bottom: 20px;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: any;
  vitals: any[] = [];
  nurses: any[] = [];
  newNote = '';
  selectedNurse = '';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private vitalService: VitalService,
    private nurseService: NurseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientService.getPatient(id).subscribe(data => this.patient = data);
      this.vitalService.getVitals(id).subscribe(data => this.vitals = data);
    }
    this.loadNurses();
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
}
