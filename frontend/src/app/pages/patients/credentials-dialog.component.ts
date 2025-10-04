import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-credentials-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatCardModule, CommonModule],
  template: `
    <div class="dialog-wrapper">
      <h2 mat-dialog-title>Credenciales Generadas</h2>
      <mat-dialog-content>
        <mat-card class="credentials-card">
          <mat-card-content>
            <p><strong>Email:</strong> {{ data.email }}</p>
            <p><strong>Contraseña:</strong> {{ data.password }}</p>
            <p class="warning">Guarde estas credenciales para proporcionarlas al paciente.</p>
          </mat-card-content>
        </mat-card>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-raised-button color="primary" mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .credentials-card {
      background-color: transparent;
      box-shadow: none;
      margin: 0;
      border-radius: 0;
    }
    .credentials-card p {
      margin: 12px 0;
      font-size: 16px;
      line-height: 1.5;
    }
    .warning {
      color: #d32f2f;
      font-weight: 500;
      margin-top: 20px !important;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
      border-left: 4px solid #d32f2f;
    }
    mat-dialog-content {
      background-color: #f8f9fa;
      padding: 24px;
    }
    mat-dialog-title {
      background-color: #1976d2;
      color: white;
      margin: 0;
      padding: 20px 24px;
      font-weight: 500;
    }
    mat-dialog-actions {
      background-color: #f8f9fa;
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class CredentialsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CredentialsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string; password: string }
  ) {}
}
