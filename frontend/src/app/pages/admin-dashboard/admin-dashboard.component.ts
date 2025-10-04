import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseService } from '../../services/nurse.service';
import { PatientService } from '../../services/patient.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NurseDialogComponent, NurseData } from '../nurses/nurse-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    FormsModule,
    NurseDialogComponent
  ],
  template: `
    <div class="admin-dashboard-container">
      <h1>Admin Dashboard - Gestión de Enfermeros y Pacientes</h1>

      <section class="nurses-section">
        <div class="header">
          <h2>Enfermeros</h2>
          <button mat-raised-button color="primary" (click)="openNewNurse()">
            <mat-icon>add</mat-icon>
            Nuevo Enfermero
          </button>
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar enfermeros</mat-label>
          <input matInput [(ngModel)]="nurseSearchTerm" (input)="filterNurses()" placeholder="Nombre, email..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="nurses-list">
          <mat-card *ngFor="let nurse of paginatedNurses" class="nurse-card">
            <mat-card-header>
              <mat-card-title>{{ nurse.name }}</mat-card-title>
              <mat-card-subtitle>{{ nurse.email }}</mat-card-subtitle>
              <mat-icon mat-card-avatar>local_hospital</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p class="shift">Turno: {{ nurse.shift || 'No asignado' }}</p>
              <p class="details">ID: {{ nurse._id }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="editNurse(nurse)">
                <mat-icon>edit</mat-icon>
                Editar
              </button>
              <button mat-button color="warn" (click)="deleteNurse(nurse._id)">
                <mat-icon>delete</mat-icon>
                Eliminar
              </button>
              <button mat-button color="accent" (click)="selectNurse(nurse)">
                <mat-icon>assignment_ind</mat-icon>
                Asignar Pacientes
              </button>
            </mat-card-actions>
          </mat-card>
        </div>


      </section>

      <section class="patients-section" *ngIf="selectedNurse">
        <h2>Pacientes asignados a {{ selectedNurse.name }}</h2>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar pacientes</mat-label>
          <input matInput [(ngModel)]="patientSearchTerm" (input)="filterPatients()" placeholder="Nombre..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="patients-list">
          <mat-card *ngFor="let patient of filteredPatients" class="patient-card">
            <mat-card-header>
              <mat-card-title>{{ patient.name }}</mat-card-title>
              <mat-card-subtitle>{{ patient.dni }}</mat-card-subtitle>
              <mat-icon mat-card-avatar>person</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p>Tipo de alta: {{ patient.dischargeType }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="warn" (click)="unassignPatient(patient._id)">
                <mat-icon>remove_circle</mat-icon>
                Desasignar
              </button>
              <button mat-button color="warn" (click)="deletePatient(patient._id)">
                <mat-icon>delete</mat-icon>
                Eliminar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <h3>Pacientes disponibles para asignar</h3>
        <div class="available-patients-list">
          <mat-card *ngFor="let patient of availablePatients" class="patient-card">
            <mat-card-header>
              <mat-card-title>{{ patient.name }}</mat-card-title>
              <mat-card-subtitle>{{ patient.dni }}</mat-card-subtitle>
              <mat-icon mat-card-avatar>person_add</mat-icon>
            </mat-card-header>
            <mat-card-actions>
              <button mat-button color="primary" (click)="assignPatient(patient._id)">
                <mat-icon>add_circle</mat-icon>
                Asignar
              </button>
              <button mat-button color="warn" (click)="deletePatient(patient._id)">
                <mat-icon>delete</mat-icon>
                Eliminar
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
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
    .search-field {
      width: 100%;
      margin-bottom: 20px;
    }
    .nurses-list, .patients-list, .available-patients-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .nurse-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid var(--medical-secondary);
    }
    .patient-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid #4CAF50;
    }
    .nurse-card:hover, .patient-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    .shift {
      font-weight: 500;
      color: var(--medical-text);
      margin: 8px 0;
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
      .nurses-list, .patients-list, .available-patients-list {
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
export class AdminDashboardComponent implements OnInit {
  nurses: any[] = [];
  filteredNurses: any[] = [];
  paginatedNurses: any[] = [];
  nurseSearchTerm = '';
  pageSize = 6;
  currentPage = 0;

  selectedNurse: any = null;
  patients: any[] = [];
  filteredPatients: any[] = [];
  availablePatients: any[] = [];
  patientSearchTerm = '';

  constructor(
    private nurseService: NurseService,
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNurses();
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(res => {
      this.nurses = res;
      this.filteredNurses = [...this.nurses];
      this.updatePagination();
    });
  }

  filterNurses() {
    if (!this.nurseSearchTerm) {
      this.filteredNurses = [...this.nurses];
    } else {
      const term = this.nurseSearchTerm.toLowerCase();
      this.filteredNurses = this.nurses.filter(nurse =>
        nurse.name.toLowerCase().includes(term) ||
        nurse.email.toLowerCase().includes(term)
      );
    }
    this.currentPage = 0;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedNurses = this.filteredNurses.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  openNewNurse() {
    const dialogRef = this.dialog.open(NurseDialogComponent, {
      width: '600px',
      data: { name: '', email: '', shift: '' }
    });

    dialogRef.afterClosed().subscribe((result: NurseData | undefined) => {
      if (result) {
        this.nurseService.addNurse(result).subscribe(() => {
          this.snackBar.open('Enfermero creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadNurses();
        });
      }
    });
  }

  editNurse(nurse: any) {
    const dialogRef = this.dialog.open(NurseDialogComponent, {
      width: '600px',
      data: nurse
    });

    dialogRef.afterClosed().subscribe((result: NurseData | undefined) => {
      if (result) {
        this.nurseService.updateNurse(nurse._id, result).subscribe(() => {
          this.snackBar.open('Enfermero actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadNurses();
        });
      }
    });
  }

  deleteNurse(id: string) {
    if (confirm('¿Está seguro de que desea eliminar este enfermero?')) {
      this.nurseService.deleteNurse(id).subscribe(() => {
        this.snackBar.open('Enfermero eliminado', 'Cerrar', { duration: 3000 });
        this.loadNurses();
        if (this.selectedNurse && this.selectedNurse._id === id) {
          this.selectedNurse = null;
          this.patients = [];
          this.filteredPatients = [];
          this.availablePatients = [];
        }
      });
    }
  }

  selectNurse(nurse: any) {
    this.selectedNurse = nurse;
    this.loadPatientsForNurse(nurse._id);
  }

  loadPatientsForNurse(nurseId: string) {
    this.patientService.getPatients({ assignedTo: nurseId }).subscribe(res => {
      this.patients = res.items;
      this.filteredPatients = [...this.patients];
      this.loadAvailablePatients(nurseId);
    });
  }

  loadAvailablePatients(nurseId: string) {
    this.patientService.getPatients({}).subscribe(res => {
      this.availablePatients = res.items.filter((p: any) => !p.assignedNurses.some((n: any) => n._id === nurseId));
    });
  }

  filterPatients() {
    if (!this.patientSearchTerm) {
      this.filteredPatients = [...this.patients];
    } else {
      const term = this.patientSearchTerm.toLowerCase();
      this.filteredPatients = this.patients.filter(patient =>
        patient.name.toLowerCase().includes(term)
      );
    }
  }

  assignPatient(patientId: string) {
    if (!this.selectedNurse) return;
    this.patientService.assignNurse(patientId, this.selectedNurse._id).subscribe(() => {
      this.snackBar.open('Paciente asignado exitosamente', 'Cerrar', { duration: 3000 });
      this.loadPatientsForNurse(this.selectedNurse._id);
    });
  }

  unassignPatient(patientId: string) {
    if (!this.selectedNurse) return;
    this.patientService.unassignNurse(patientId, this.selectedNurse._id).subscribe(() => {
      this.snackBar.open('Paciente desasignado exitosamente', 'Cerrar', { duration: 3000 });
      this.loadPatientsForNurse(this.selectedNurse._id);
    });
  }

  deletePatient(patientId: string) {
    if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
      this.patientService.deletePatient(patientId).subscribe({
        next: () => {
          this.snackBar.open('Paciente eliminado', 'Cerrar', { duration: 3000 });
          if (this.selectedNurse) {
            this.loadPatientsForNurse(this.selectedNurse._id);
          } else {
            this.loadNurses();
          }
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
