import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NurseService } from '../../services/nurse.service';
import { AuthService } from '../../services/auth.service';
import { CredentialsDialogComponent } from './credentials-dialog.component';


export interface PatientData {
  _id?: string;
  name: string;
  dni?: string;
  birthDate: string;
  contact?: {
    phone?: string;
    address?: string;
  };
  clinicalSummary: string;
  dischargeType: string;
  assignedNurses?: string[];
  email?: string;
  password?: string;
  createCredentials?: boolean;
}

@Component({
  selector: 'app-patient-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    CommonModule
  ],
  template: `
    <div class="dialog-wrapper">
      <h2 mat-dialog-title>{{ data._id ? 'Editar Paciente' : 'Nuevo Paciente' }}</h2>
      <mat-dialog-content>
        <mat-card class="patient-form-card">
          <mat-card-content>
            <form [formGroup]="patientForm" class="patient-form">
              <section class="form-section">
                <h3>Información Personal</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="name" />
                  <mat-error *ngIf="patientForm.get('name')?.hasError('required')">Nombre es requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>DNI</mat-label>
                  <input matInput formControlName="dni" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Fecha de Nacimiento</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="birthDate" />
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="patientForm.get('birthDate')?.hasError('required')">Fecha de nacimiento es requerida</mat-error>
                </mat-form-field>
              </section>

              <section class="form-section">
                <h3>Información de Contacto</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Teléfono</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Dirección</mat-label>
                  <input matInput formControlName="address" />
                </mat-form-field>
                <div class="email-credentials-row">
                  <mat-form-field appearance="outline" class="email-field">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" />
                    <mat-error *ngIf="patientForm.get('email')?.hasError('email')">Email inválido</mat-error>
                  </mat-form-field>
                  <button mat-raised-button type="button" (click)="generateCredentials()" class="generate-credentials-btn">Generar Credenciales</button>
                </div>
              </section>

              <section class="form-section">
                <h3>Información Clínica</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Resumen Clínico</mat-label>
                  <textarea matInput formControlName="clinicalSummary" rows="4"></textarea>
                  <mat-error *ngIf="patientForm.get('clinicalSummary')?.hasError('required')">Resumen clínico es requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tipo de Alta</mat-label>
                  <mat-select formControlName="dischargeType">
                    <mat-option value="post-operatorio">Post-operatorio</mat-option>
                    <mat-option value="crónico compensado">Crónico compensado</mat-option>
                    <mat-option value="rehabilitación">Rehabilitación</mat-option>
                  </mat-select>
                  <mat-error *ngIf="patientForm.get('dischargeType')?.hasError('required')">Tipo de alta es requerido</mat-error>
                </mat-form-field>
              </section>

              <section class="form-section" *ngIf="isAdmin">
                <h3>Asignación de Enfermeras</h3>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Enfermeras Asignadas</mat-label>
                  <mat-select formControlName="assignedNurses" multiple>
                    <mat-option *ngFor="let nurse of nurses" [value]="nurse._id">{{ nurse.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </section>
            </form>
          </mat-card-content>
        </mat-card>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="patientForm.invalid" (click)="onSave()">Guardar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      overflow: hidden;
      max-width: 600px;
    }
    .patient-form-card {
      background-color: transparent;
      box-shadow: none;
      margin: 0;
      border-radius: 0;
    }
    .patient-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-section h3 {
      margin: 0 0 16px 0;
      color: #1976d2;
      font-weight: 500;
      font-size: 1.1rem;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }
    .full-width {
      width: 100%;
    }
    .email-credentials-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .email-field {
      flex: 1;
    }
    .generate-credentials-btn {
      margin-top: 0;
      height: 56px;
      white-space: nowrap;
    }
    mat-dialog-content {
      background-color: #ffffff;
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }
    mat-dialog-title {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      margin: 0;
      padding: 20px 24px;
      font-weight: 500;
      font-size: 1.25rem;
    }
    mat-dialog-actions {
      background-color: #f8f9fa;
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }
    mat-form-field {
      background-color: #ffffff;
      border-radius: 8px;
      margin-bottom: 0;
      box-shadow: none !important;
      border: 1px solid #ccc !important;
    }
    .mat-mdc-form-field-outline {
      display: none !important;
    }
    .mat-mdc-text-field-wrapper {
      background-color: #ffffff;
    }
    .mat-mdc-input-element {
      color: #333;
    }
    .mat-mdc-form-field-label {
      color: #666;
    }
    .mat-mdc-form-field-required-marker {
      color: #d32f2f;
    }
    button[mat-raised-button] {
      margin-top: 0;
      margin-right: 8px;
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      border-radius: 8px;
      font-weight: 500;
    }
    button[mat-raised-button]:hover {
      background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
    }
  `]
})
export class PatientDialogComponent implements OnInit {
  patientForm: FormGroup;
  nurses: any[] = [];
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PatientData,
    private nurseService: NurseService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.patientForm = this.fb.group({
      name: [data.name || '', Validators.required],
      dni: [data.dni || ''],
      birthDate: [data.birthDate ? new Date(data.birthDate) : '', Validators.required],
      phone: [data.contact?.phone || ''],
      address: [data.contact?.address || ''],
      email: [data.email || '', Validators.email],
      createCredentials: [data.createCredentials || false],
      clinicalSummary: [data.clinicalSummary || '', Validators.required],
      dischargeType: [data.dischargeType || '', Validators.required],
      assignedNurses: [data.assignedNurses || []]
    });
  }

  ngOnInit() {
    if (this.isAdmin) {
      this.loadNurses();
    }
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(nurses => this.nurses = nurses);
  }

  generateCredentials() {
    const name = this.patientForm.get('name')?.value;
    if (!name) {
      alert('Ingrese el nombre primero');
      return;
    }
    const email = name.toLowerCase().replace(/\s+/g, '') + '@paciente.com';
    const password = Math.random().toString(36).slice(-8);
    this.patientForm.patchValue({ email, createCredentials: true });
    this.data.password = password;
    this.dialog.open(CredentialsDialogComponent, {
      data: { email, password }
    });
  }

  onSave() {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;
      const patientData: PatientData = {
        ...this.data,
        name: formValue.name,
        dni: formValue.dni,
        birthDate: formValue.birthDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        contact: {
          phone: formValue.phone,
          address: formValue.address
        },
        email: formValue.email,
        password: this.data.password,
        createCredentials: this.data.createCredentials || formValue.createCredentials,
        clinicalSummary: formValue.clinicalSummary,
        dischargeType: formValue.dischargeType,
        assignedNurses: formValue.assignedNurses
      };
      this.dialogRef.close(patientData);
    }
  }
}
