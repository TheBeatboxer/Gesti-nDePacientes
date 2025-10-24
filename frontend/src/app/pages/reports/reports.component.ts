import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PatientService } from '../../services/patient.service';
import { NurseService } from '../../services/nurse.service';
import { NurseSidebarComponent } from '../../shared/nurse-sidebar.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule, BaseChartDirective, NurseSidebarComponent],
  template: `
    <app-nurse-sidebar>
      <h1>Reportes Médicos</h1>
    <div class="reports-grid">
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Pacientes por Edad</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas baseChart
            [data]="ageChartData"
            [options]="ageChartOptions"
            [type]="ageChartType">
          </canvas>
        </mat-card-content>
      </mat-card>
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Enfermeros por Turno</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas baseChart
            [data]="shiftChartData"
            [options]="shiftChartOptions"
            [type]="shiftChartType">
          </canvas>
        </mat-card-content>
      </mat-card>
    </div>
    <mat-card class="summary-card">
      <mat-card-header>
        <mat-card-title>Resumen</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Total de Pacientes: {{ patients.length }}</p>
        <p>Total de Enfermeros: {{ nurses.length }}</p>
        <p>Promedio de Edad de Pacientes: {{ averageAge }} años</p>
      </mat-card-content>
    </mat-card>
    </app-nurse-sidebar>
  `,
  styles: [`
    .reports-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .chart-card, .summary-card {
      padding: 20px;
    }
    .chart-card canvas {
      max-height: 300px;
    }
    @media (max-width: 768px) {
      .reports-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  patients: any[] = [];
  nurses: any[] = [];
  averageAge = 0;

  ageChartType: ChartType = 'bar';
  ageChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Número de Pacientes',
      data: [],
      backgroundColor: 'rgba(33, 150, 243, 0.5)',
      borderColor: 'rgba(33, 150, 243, 1)',
      borderWidth: 1
    }]
  };
  ageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: { y: { beginAtZero: true } }
  };

  shiftChartType: ChartType = 'pie';
  shiftChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      borderColor: ['#4caf50', '#ff9800', '#f44336'],
      borderWidth: 1
    }]
  };
  shiftChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  constructor(
    private patientService: PatientService,
    private nurseService: NurseService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.patientService.getPatients().subscribe((res: any) => {
      this.patients = res.items || res;
      this.calculateAverageAge();
      this.updateAgeChart();
    });

    this.nurseService.getNurses().subscribe(res => {
      this.nurses = res;
      this.updateShiftChart();
    });
  }

  calculateAverageAge() {
    if (this.patients.length === 0) return;
    const totalAge = this.patients.reduce((sum, p) => sum + this.calculateAge(p.birthDate), 0);
    this.averageAge = Math.round(totalAge / this.patients.length);
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

  updateAgeChart() {
    const ageGroups = { '0-18': 0, '19-40': 0, '41-60': 0, '61+': 0 };
    this.patients.forEach(p => {
      const age = this.calculateAge(p.birthDate);
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 40) ageGroups['19-40']++;
      else if (age <= 60) ageGroups['41-60']++;
      else ageGroups['61+']++;
    });

    this.ageChartData = {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Número de Pacientes',
        data: Object.values(ageGroups),
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1
      }]
    };
  }

  updateShiftChart() {
    const shifts = { 'Mañana': 0, 'Tarde': 0, 'Noche': 0 };
    this.nurses.forEach(n => {
      if (n.shift in shifts) shifts[n.shift as keyof typeof shifts]++;
    });

    this.shiftChartData = {
      labels: Object.keys(shifts),
      datasets: [{
        data: Object.values(shifts),
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 1
      }]
    };
  }
}
