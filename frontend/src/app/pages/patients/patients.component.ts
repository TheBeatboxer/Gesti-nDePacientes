import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { NurseService } from '../../services/nurse.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientDialogComponent, PatientData } from './patient-dialog.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    FormsModule,
    RouterModule,
    PatientDialogComponent,
    MatSnackBarModule
  ],
  template: `
    <div class="patients-container">
      <div class="header">
        <h1>Gestión de Pacientes</h1>
        <button mat-raised-button color="primary" (click)="openNewPatient()">
          <mat-icon>add</mat-icon>
          Nuevo Paciente
        </button>
      </div>

      <div class="filters-row" *ngIf="isAdmin">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar por enfermera</mat-label>
          <mat-select [(ngModel)]="selectedNurse" (selectionChange)="filterPatients()">
            <mat-option value="">Todas las enfermeras</mat-option>
            <mat-option *ngFor="let nurse of nurses" [value]="nurse._id">{{ nurse.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar pacientes</mat-label>
        <input matInput [(ngModel)]="searchTerm" (input)="filterPatients()" placeholder="Nombre, diagnóstico..." />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="patients-grid">
        <mat-card *ngFor="let patient of paginatedPatients" class="patient-card" routerLink="/patient/{{patient._id}}">
          <mat-card-header>
            <mat-card-title>{{ patient.name }}</mat-card-title>
            <mat-card-subtitle>{{ calculateAge(patient.birthDate) }} años</mat-card-subtitle>
            <mat-icon mat-card-avatar>person</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <p class="diagnosis">{{ patient.clinicalSummary || 'Sin diagnóstico registrado' }}</p>
            <p class="discharge-type">Tipo de Alta: {{ patient.dischargeType || 'No especificado' }}</p>
            <p class="details">ID: {{ patient._id }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="editPatient($event, patient)">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-button color="warn" *ngIf="isAdmin" (click)="deletePatient($event, patient._id)">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <mat-paginator
        [length]="filteredPatients.length"
        [pageSize]="pageSize"
        [pageSizeOptions]="[6, 12, 18, 24]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .patients-container {
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
    .search-field {
      width: 100%;
      margin-bottom: 20px;
    }
    .patients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .patient-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid var(--medical-primary);
    }
    .patient-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    .patient-card mat-card-title {
      color: var(--medical-primary);
    }
    .diagnosis {
      font-weight: 500;
      color: var(--medical-text);
      margin: 8px 0;
    }
    .discharge-type {
      font-weight: 500;
      color: var(--medical-primary);
      margin: 4px 0;
    }
    .details {
      color: var(--medical-text-secondary);
      font-size: 0.9rem;
      margin: 4px 0;
    }
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
    }
    @media (max-width: 768px) {
      .patients-grid {
        grid-template-columns: 1fr;
      }
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  paginatedPatients: any[] = [];
  nurses: any[] = [];
  searchTerm = '';
  selectedNurse = '';
  pageSize = 6;
  currentPage = 0;
  isAdmin = false;

  constructor(
    private patientService: PatientService,
    private nurseService: NurseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  ngOnInit() {
    this.loadPatients();
    if (this.isAdmin) {
      this.loadNurses();
    }
  }

  loadPatients() {
    const params: any = {};
    if (this.selectedNurse) {
      params.assignedTo = this.selectedNurse;
    }
    this.patientService.getPatients(params).subscribe((res: any) => {
      this.patients = res.items || res;
      // Sort patients by name ascending
      this.patients.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredPatients = [...this.patients];
      this.updatePagination();
    });
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe((nurses: any[]) => {
      this.nurses = nurses;
    });
  }

  filterPatients() {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPatients = this.patients.filter(patient =>
        patient.name.toLowerCase().includes(term) ||
        (patient.clinicalSummary && patient.clinicalSummary.toLowerCase().includes(term)) ||
        (patient.dischargeType && patient.dischargeType.toLowerCase().includes(term))
      );
    }
    this.currentPage = 0;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPatients = this.filteredPatients.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
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

  openNewPatient() {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      width: '600px',
      data: { name: '', dni: '', birthDate: '', contact: { phone: '', address: '' }, clinicalSummary: '', dischargeType: '', assignedNurses: [] }
    });

    dialogRef.afterClosed().subscribe((result: PatientData | undefined) => {
      if (result) {
        this.patientService.createPatient(result).subscribe(() => {
          this.snackBar.open('Paciente creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadPatients();
        });
      }
    });
  }

  editPatient(event: Event, patient: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      width: '600px',
      data: patient
    });

    dialogRef.afterClosed().subscribe((result: PatientData | undefined) => {
      if (result) {
        this.patientService.updatePatient(patient._id, result).subscribe(() => {
          this.snackBar.open('Paciente actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadPatients();
        });
      }
    });
  }

  deletePatient(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.snackBar.open('Paciente eliminado', 'Cerrar', { duration: 3000 });
          this.loadPatients();
        },
        error: (error) => {
          if (error.status === 403) {
            this.snackBar.open('No tienes permisos para eliminar pacientes. Solo administradores pueden hacerlo.', 'Cerrar', { duration: 5000 });
          } else {
            this.snackBar.open('Error al eliminar paciente', 'Cerrar', { duration: 3000 });
          }
        }
      });
    }
  }
}
