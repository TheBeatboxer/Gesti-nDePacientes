import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon class="dialog-icon">check_circle</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
        <div class="appointment-details" *ngIf="data.appointment">
          <div class="detail-row">
            <strong>Paciente:</strong> {{ data.appointment.patientId?.name }}
          </div>
          <div class="detail-row">
            <strong>Fecha:</strong> {{ data.appointment.date | date:'dd/MM/yyyy HH:mm' }}
          </div>
          <div class="detail-row">
            <strong>Tipo:</strong> {{ getTypeLabel(data.appointment.type) }}
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button class="cancel-btn" (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-raised-button class="confirm-gradient-btn" (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-dialog-container {
      background: transparent !important;
      border-radius: 12px !important;
      box-shadow: none !important;
    }

    .confirm-dialog {
      padding: 0;
      min-width: 400px;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .dialog-header {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      padding: 24px;
      text-align: center;
      position: relative;
    }

    .dialog-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.9;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    mat-dialog-content {
      padding: 24px;
    }

    p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    }

    .appointment-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-row strong {
      color: var(--medical-primary);
      font-weight: 600;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px;
      margin: 0;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
      border-radius: 8px;
      text-transform: uppercase;
      font-weight: 500;
      min-width: 100px;
    }

    .cancel-btn:hover {
      background: #e0e0e0;
    }

    .confirm-gradient-btn {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%) !important;
      color: white !important;
      border-radius: 8px !important;
      text-transform: uppercase !important;
      font-weight: 500 !important;
      min-width: 120px;
      transition: all 0.3s ease;
    }

    .confirm-gradient-btn:hover {
      background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      appointment?: any;
    }
  ) {}

  getTypeLabel(type: string): string {
    switch (type) {
      case 'consulta': return 'Consulta';
      case 'control': return 'Control';
      case 'procedimiento': return 'Procedimiento';
      case 'visita_domiciliaria': return 'Visita Domiciliaria';
      default: return type;
    }
  }
}
