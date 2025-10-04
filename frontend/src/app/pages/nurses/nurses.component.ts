import { Component, OnInit } from '@angular/core';
import { NurseService } from '../../services/nurse.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NurseDialogComponent, NurseData } from './nurse-dialog.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nurses',
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
    FormsModule,
    NurseDialogComponent,
    MatSnackBarModule
  ],
  template: `
    <div class="nurses-container">
      <div class="header">
        <h1>Gestión de Enfermeros</h1>
        <button mat-raised-button color="primary" (click)="openNewNurse()">
          <mat-icon>add</mat-icon>
          Nuevo Enfermero
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar enfermeros</mat-label>
        <input matInput [(ngModel)]="searchTerm" (input)="filterNurses()" placeholder="Nombre, email..." />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="nurses-grid">
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
          </mat-card-actions>
        </mat-card>
      </div>

      <mat-paginator
        [length]="filteredNurses.length"
        [pageSize]="pageSize"
        [pageSizeOptions]="[6, 12, 18, 24]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .nurses-container {
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
    .nurses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .nurse-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid var(--medical-secondary);
    }
    .nurse-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    .nurse-card mat-card-title {
      color: var(--medical-primary);
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
      .nurses-grid {
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
export class NursesComponent implements OnInit {
  nurses: any[] = [];
  filteredNurses: any[] = [];
  paginatedNurses: any[] = [];
  searchTerm = '';
  pageSize = 6;
  currentPage = 0;

  constructor(
    private nurseService: NurseService,
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
    if (!this.searchTerm) {
      this.filteredNurses = [...this.nurses];
    } else {
      const term = this.searchTerm.toLowerCase();
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

  onPageChange(event: PageEvent) {
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
      });
    }
  }
}
