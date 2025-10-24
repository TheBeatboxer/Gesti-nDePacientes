import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentDialogComponent } from './appointment-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { NurseSidebarComponent } from '../../shared/nurse-sidebar.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    NurseSidebarComponent
  ],
  template: `
    <div class="appointments-container">
        <div class="header">
        <h1>{{ isPatient ? 'Mis Citas' : 'Gestión de Citas' }}</h1>
        <button mat-raised-button color="primary" (click)="openAppointmentDialog()" *ngIf="!isPatient">
          <mat-icon>add</mat-icon>
          Nueva Cita
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="programada">Programada</mat-option>
            <mat-option value="confirmada">Confirmada</mat-option>
            <mat-option value="completada">Completada</mat-option>
            <mat-option value="cancelada">Cancelada</mat-option>
            <mat-option value="no_asistio">No Asistió</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha desde</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="applyFilters()">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha hasta</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="applyFilters()">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="appointments-table">

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha y Hora</th>
              <td mat-cell *matCellDef="let appointment">
                {{ appointment.date | date:'dd/MM/yyyy HH:mm' }}
              </td>
            </ng-container>

            <!-- Patient Column -->
            <ng-container matColumnDef="patient" *ngIf="!isPatient">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Paciente</th>
              <td mat-cell *matCellDef="let appointment">
                {{ appointment.patientId?.name }}
              </td>
            </ng-container>

            <!-- Nurse Column -->
            <ng-container matColumnDef="nurse">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Enfermero</th>
              <td mat-cell *matCellDef="let appointment">
                {{ appointment.nurseId?.name }}
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
              <td mat-cell *matCellDef="let appointment">
                <mat-chip [style.background-color]="getTypeColor(appointment.type)" [style.color]="'white'" selected>
                  {{ getTypeLabel(appointment.type) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let appointment">
                <mat-chip [style.background-color]="getStatusColor(appointment.status)" [style.color]="'white'" selected>
                  {{ getStatusLabel(appointment.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let appointment">
                <div class="action-buttons">
                  <button mat-raised-button class="medical-gradient-btn" (click)="viewAppointment(appointment)">
                    <mat-icon>visibility</mat-icon>
                    Ver
                  </button>
                  <button mat-raised-button class="medical-gradient-btn confirm-btn" (click)="confirmAppointment(appointment)" *ngIf="appointment.status === 'programada' && isPatient">
                    <mat-icon>check_circle</mat-icon>
                    Confirmar
                  </button>
                  <button mat-raised-button class="medical-gradient-btn edit-btn" (click)="editAppointment(appointment)" *ngIf="!isPatient">
                    <mat-icon>edit</mat-icon>
                    Editar
                  </button>
                  <button mat-raised-button class="medical-gradient-btn delete-btn" (click)="deleteAppointment(appointment)" *ngIf="!isPatient">
                    <mat-icon>delete</mat-icon>
                    Eliminar
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="getDisplayedColumns()"></tr>
            <tr mat-row *matRowDef="let row; columns: getDisplayedColumns();"></tr>
          </table>

          <mat-paginator
            [pageSizeOptions]="[5, 10, 20]"
            showFirstLastButtons
            aria-label="Seleccionar página">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .appointments-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 {
      color: var(--medical-primary);
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .appointments-table {
      width: 100%;
    }

    .mat-mdc-chip {
      font-size: 12px;
      min-height: 24px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .action-buttons button {
      font-size: 12px;
      padding: 4px 8px;
      min-height: 32px;
    }

    .medical-gradient-btn {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%) !important;
      color: white !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      text-transform: none !important;
      transition: all 0.3s ease;
    }

    .medical-gradient-btn:hover {
      background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
    }

    .confirm-btn {
      background: linear-gradient(135deg, #4caf50 0%, #81c784 100%) !important;
    }

    .confirm-btn:hover {
      background: linear-gradient(135deg, #388e3c 0%, #66bb6a 100%) !important;
    }

    .edit-btn {
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%) !important;
    }

    .edit-btn:hover {
      background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%) !important;
    }

    .delete-btn {
      background: linear-gradient(135deg, #f44336 0%, #ef5350 100%) !important;
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%) !important;
    }

    .delete-option {
      color: #f44336;
    }

    .delete-option .mat-icon {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters {
        flex-direction: column;
      }

      .filters mat-form-field {
        min-width: 100%;
      }
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  displayedColumns: string[] = ['date', 'patient', 'nurse', 'type', 'status', 'actions'];

  getDisplayedColumns(): string[] {
    return this.isPatient ? ['date', 'nurse', 'type', 'status', 'actions'] : this.displayedColumns;
  }

  isPatient: boolean = false;
  isNurse: boolean = false;
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  statusFilter = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.isPatient = user.roles.includes('PATIENT');
    this.isNurse = user.roles.includes('NURSE');
    this.loadAppointments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAppointments() {
    const user = this.authService.getUser();
    if (user.roles.includes('PATIENT')) {
      this.appointmentService.getMyAppointments().subscribe(data => {
        this.dataSource.data = data.appointments || data;
      });
    } else {
      this.appointmentService.getAppointments().subscribe(data => {
        this.dataSource.data = data.appointments || data;
      });
    }
  }

  applyFilters() {
    const params: any = {};

    if (this.statusFilter) params.status = this.statusFilter;
    if (this.startDate) params.startDate = this.startDate.toISOString();
    if (this.endDate) params.endDate = this.endDate.toISOString();

    this.appointmentService.getAppointments(params).subscribe(data => {
      this.dataSource.data = data.appointments || data;
    });
  }

  openAppointmentDialog(appointment?: any) {
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '600px',
      data: { appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  viewAppointment(appointment: any) {
    // For now, just open edit dialog in view mode
    this.openAppointmentDialog(appointment);
  }

  editAppointment(appointment: any) {
    this.openAppointmentDialog(appointment);
  }

  confirmAppointment(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Confirmar Cita',
        message: '¿Está seguro de que desea confirmar esta cita médica?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        appointment: appointment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.confirmAppointment(appointment._id).subscribe(() => {
          this.snackBar.open('Cita confirmada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadAppointments();
        });
      }
    });
  }

  deleteAppointment(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Cita',
        message: '¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.deleteAppointment(appointment._id).subscribe(() => {
          this.snackBar.open('Cita eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadAppointments();
        });
      }
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'consulta': return '#1976D2'; // Dark blue
      case 'control': return '#388E3C'; // Dark green
      case 'procedimiento': return '#F57C00'; // Orange
      case 'visita_domiciliaria': return '#7B1FA2'; // Purple
      default: return '#757575'; // Gray
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'consulta': return 'Consulta';
      case 'control': return 'Control';
      case 'procedimiento': return 'Procedimiento';
      case 'visita_domiciliaria': return 'Visita Domiciliaria';
      default: return type;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'programada': return '#2196F3'; // Medical blue
      case 'confirmada': return '#4CAF50'; // Green
      case 'completada': return '#9E9E9E'; // Gray
      case 'cancelada': return '#F44336'; // Red
      case 'no_asistio': return '#F44336'; // Red
      default: return '#000000';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Confirmada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'no_asistio': return 'No Asistió';
      default: return status;
    }
  }
}
