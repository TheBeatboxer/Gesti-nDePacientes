import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { NurseService } from '../../services/nurse.service';

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ isEditing ? 'Editar Cita' : 'Nueva Cita' }}</h2>

      <mat-dialog-content>
        <form #appointmentForm="ngForm">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Paciente *</mat-label>
              <mat-select [(ngModel)]="appointment.patientId" name="patientId" required>
                <mat-option *ngFor="let patient of patients" [value]="patient._id">
                  {{ patient.name }} - {{ patient.dni }}
                </mat-option>
              </mat-select>

            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Enfermero *</mat-label>
              <mat-select [(ngModel)]="appointment.nurseId" name="nurseId" required>
                <mat-option *ngFor="let nurse of nurses" [value]="nurse._id">
                  {{ nurse.name }}
                </mat-option>
              </mat-select>

            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Fecha *</mat-label>
              <input matInput [matDatepicker]="datePicker" [(ngModel)]="appointment.date" name="date" required>
              <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
              <mat-datepicker #datePicker></mat-datepicker>

            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Hora *</mat-label>
              <input matInput type="time" [(ngModel)]="appointment.time" name="time" required>

            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Tipo de Cita *</mat-label>
              <mat-select [(ngModel)]="appointment.type" name="type" required>
                <mat-option value="consulta">Consulta</mat-option>
                <mat-option value="control">Control</mat-option>
                <mat-option value="procedimiento">Procedimiento</mat-option>
                <mat-option value="visita_domiciliaria">Visita Domiciliaria</mat-option>
              </mat-select>

            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Duración (minutos) *</mat-label>
              <input matInput type="number" [(ngModel)]="appointment.duration" name="duration" required min="15" max="480">

            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ubicación</mat-label>
              <input matInput [(ngModel)]="appointment.location" name="location" placeholder="Hospital, Domicilio, Consultorio, etc.">

            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas</mat-label>
              <textarea matInput [(ngModel)]="appointment.notes" name="notes" rows="3" placeholder="Información adicional sobre la cita, preparación necesaria, etc."></textarea>

            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="!isEditing">
            <div class="reminders-section">
              <h4>Recordatorios Automáticos</h4>

              <mat-checkbox [(ngModel)]="reminderTypes.email" name="emailReminder">📧 Email al paciente</mat-checkbox>
              <mat-checkbox [(ngModel)]="reminderTypes.sms" name="smsReminder">📱 SMS al paciente</mat-checkbox>
              <mat-checkbox [(ngModel)]="reminderTypes.in_app" name="inAppReminder" checked="true">📱 Notificación en la App</mat-checkbox>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">CANCELAR</button>
        <button mat-raised-button color="primary" (click)="saveAppointment()" [disabled]="!appointmentForm.form.valid">
          {{ isEditing ? 'ACTUALIZAR' : 'CREAR' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
      background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    h2 {
      color: var(--medical-primary);
      margin-bottom: 20px;
      text-align: center;
      font-weight: 600;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 8px);
    }

    mat-form-field {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      border: 1px solid rgba(0, 123, 255, 0.2);
    }

    mat-form-field.mat-focused {
      background: white;
      border: 2px solid #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    .reminders-section {
      width: 100%;
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(66, 165, 245, 0.05));
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(25, 118, 210, 0.1);
    }

    .reminders-section h4 {
      margin: 0 0 12px 0;
      color: var(--medical-primary);
      font-size: 16px;
      font-weight: 600;
    }

    .reminders-section mat-checkbox {
      margin-right: 16px;
      margin-bottom: 8px;
    }



    mat-dialog-actions {
      padding: 16px 0 0 0;
      border-top: 1px solid rgba(25, 118, 210, 0.1);
      margin-top: 20px;
    }

    button[mat-button] {
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
    }

    button[mat-raised-button] {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      border-radius: 6px;
      font-weight: 600;
      padding: 8px 24px;
      transition: all 0.3s ease;
      text-transform: uppercase;
    }

    button[mat-raised-button]:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    button[mat-raised-button]:disabled {
      background: linear-gradient(45deg, #ccc, #ddd);
      color: #666;
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: 90vw;
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class AppointmentDialogComponent implements OnInit {
  appointment: any = {
    patientId: '',
    nurseId: '',
    date: null,
    time: '',
    type: 'consulta',
    duration: 30,
    location: '',
    notes: ''
  };

  reminderTypes = {
    email: false,
    sms: false,
    in_app: true
  };

  patients: any[] = [];
  nurses: any[] = [];
  isEditing = false;

  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private nurseService: NurseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPatients();
    this.loadNurses();

    if (this.data?.appointment) {
      this.isEditing = true;
      this.appointment = { ...this.data.appointment };

      // Convert date to Date object and extract time
      if (this.appointment.date) {
        const date = new Date(this.appointment.date);
        this.appointment.date = date;
        this.appointment.time = date.toTimeString().slice(0, 5);
      }
    }
  }

  loadPatients() {
    this.patientService.getPatients().subscribe(data => {
      this.patients = data.items || data;
    });
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(data => {
      this.nurses = data;
    });
  }

  saveAppointment() {
    // Combine date and time
    if (this.appointment.date && this.appointment.time) {
      const [hours, minutes] = this.appointment.time.split(':');
      const date = new Date(this.appointment.date);
      date.setHours(parseInt(hours), parseInt(minutes));
      this.appointment.date = date.toISOString();
    }

    // Prepare reminder types
    const reminderTypes: string[] = [];
    if (this.reminderTypes.email) reminderTypes.push('email');
    if (this.reminderTypes.sms) reminderTypes.push('sms');
    if (this.reminderTypes.in_app) reminderTypes.push('in_app');

    const payload = {
      ...this.appointment,
      reminderTypes
    };

    const operation = this.isEditing
      ? this.appointmentService.updateAppointment(this.appointment._id, payload)
      : this.appointmentService.createAppointment(payload);

    operation.subscribe({
      next: (result) => {
        this.snackBar.open(
          this.isEditing ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.snackBar.open('Error al guardar la cita', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
