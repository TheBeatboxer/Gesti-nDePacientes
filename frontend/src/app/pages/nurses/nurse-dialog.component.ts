import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

export interface NurseData {
  _id?: string;
  name: string;
  email: string;
  shift: string;
  password?: string;
}

@Component({
  selector: 'app-nurse-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data._id ? 'Editar Enfermero' : 'Nuevo Enfermero' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="nurseForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="nurseForm.get('name')?.hasError('required')">Nombre es requerido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
          <mat-error *ngIf="nurseForm.get('email')?.hasError('required')">Email es requerido</mat-error>
          <mat-error *ngIf="nurseForm.get('email')?.hasError('email')">Email inválido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width" [hidden]="!!data._id">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password" />
          <mat-error *ngIf="nurseForm.get('password')?.hasError('required')">Contraseña es requerida</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Turno</mat-label>
          <mat-select formControlName="shift">
            <mat-option value="Mañana">Mañana</mat-option>
            <mat-option value="Tarde">Tarde</mat-option>
            <mat-option value="Noche">Noche</mat-option>
          </mat-select>
          <mat-error *ngIf="nurseForm.get('shift')?.hasError('required')">Turno es requerido</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="nurseForm.invalid" (click)="onSave()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class NurseDialogComponent {
  nurseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NurseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NurseData
  ) {
    this.nurseForm = this.fb.group({
      name: [data.name || '', Validators.required],
      email: [data.email || '', [Validators.required, Validators.email]],
      password: [data.password || '', data._id ? [] : Validators.required],
      shift: [data.shift || '', Validators.required]
    });
  }

  onSave() {
    if (this.nurseForm.valid) {
      const nurseData: NurseData = {
        ...this.data,
        ...this.nurseForm.value
      };
      this.dialogRef.close(nurseData);
    }
  }
}
