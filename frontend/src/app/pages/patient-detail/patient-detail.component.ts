import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { VitalService } from '../../services/vital.service';
import { AuthService } from '../../services/auth.service';
import { NurseService } from '../../services/nurse.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ChatComponent } from '../../shared/chat/chat.component';
import { ChatService } from '../../services/chat.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule, RouterModule, MatSnackBarModule, ChatComponent, BaseChartDirective],
  template: `
    <div class="page-wrapper">
      <div class="header-buttons">
        <button mat-button color="primary" routerLink="/patients" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          Volver a Pacientes
        </button>
        <button mat-button color="accent" (click)="generatePDF()" class="pdf-button">
          <mat-icon>download</mat-icon>
          Descargar Reporte
        </button>
      </div>
      <div class="patient-detail-container">
        <!-- Left Column -->
        <div class="column">
          <div class="section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Evolución Gráfica</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div #chartsContent class="charts-grid">
                  <div *ngIf="chartDataPressure && chartDataPressure.datasets.length > 0" class="chart-container">
                    <h4>Presión Arterial</h4>
                    <canvas baseChart [data]="chartDataPressure" [options]="chartOptions" type="line"></canvas>
                  </div>
                  <div *ngIf="chartDataTemp && chartDataTemp.datasets.length > 0" class="chart-container">
                    <h4>Temperatura</h4>
                    <canvas baseChart [data]="chartDataTemp" [options]="chartOptions" type="line"></canvas>
                  </div>
                  <div *ngIf="chartDataHeartRate && chartDataHeartRate.datasets.length > 0" class="chart-container">
                    <h4>Frecuencia Cardíaca</h4>
                    <canvas baseChart [data]="chartDataHeartRate" [options]="chartOptions" type="line"></canvas>
                  </div>
                  <div *ngIf="chartDataGlucose && chartDataGlucose.datasets.length > 0" class="chart-container">
                    <h4>Glucosa</h4>
                    <canvas baseChart [data]="chartDataGlucose" [options]="chartOptions" type="line"></canvas>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Historial de Notas</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item *ngFor="let entry of patient?.history">
                    <mat-icon mat-list-icon>note</mat-icon>
                    <p mat-line style="white-space: normal;">{{ entry.note }}</p>
                    <p mat-line style="font-size: 0.8em; color: #777;">
                      {{ entry.date | date:'fullDate' }} a las {{ entry.date | date:'shortTime' }} - por {{ entry.nurse?.name || 'Enfermero no asignado' }}
                    </p>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="section">
            <mat-card class="add-note-card">
              <mat-card-header>
                <mat-card-title>Agregar Nota de Evolución</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nota</mat-label>
                  <textarea matInput [(ngModel)]="newNote" rows="3"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Enfermero</mat-label>
                  <mat-select [(ngModel)]="selectedNurse">
                    <mat-option *ngFor="let nurse of nurses" [value]="nurse._id">{{ nurse.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </mat-card-content>
              <mat-card-actions style="justify-content: center;">
                <button mat-button color="primary" (click)="addNote()" [disabled]="!newNote || !selectedNurse">
                  <mat-icon>note_add</mat-icon>
                  Agregar Nota
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <div class="section chat-section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Chat con {{ patient?.name }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <app-chat [recipientId]="patient?.userId"></app-chat>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="section profile-section">
            <mat-card *ngIf="patient" class="patient-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>{{ patient.name }}</mat-card-title>
              <mat-card-subtitle>{{ calculateAge(patient.birthDate) }} años</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Resumen Clínico:</strong> {{ patient.clinicalSummary }}</p>
              <p><strong>Tipo de Alta:</strong> {{ patient.dischargeType }}</p>
              <p><strong>Enfermeros Asignados:</strong> {{ getAssignedNurses() }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section vitals-section">
          <mat-card class="vitals-card">
            <mat-card-header>
              <mat-card-title>Historial de Signos Vitales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="vitals-grid" *ngIf="vitals.length > 0; else noVitals">
                <mat-card *ngFor="let vital of vitals" class="vital-card" [ngClass]="getVitalClass(vital.type)">
                  <mat-card-content>
                    <div class="vital-header">
                      <mat-icon class="vital-icon">{{ getVitalIcon(vital.type) }}</mat-icon>
                      <span class="vital-type">{{ getVitalLabel(vital.type) }}</span>
                    </div>
                    <div class="vital-value">
                      {{ getVitalDisplayValue(vital) }}
                    </div>
                    <div class="vital-timestamp">
                      {{ vital.timestamp | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              <ng-template #noVitals>
                <p class="no-vitals">No hay registros de signos vitales.</p>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <mat-card class="add-vital-card" style="margin-top: 20px;">
            <mat-card-header>
              <mat-card-title>Agregar Signos Vitales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form #vitalForm="ngForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Presión arterial (sistólica)</mat-label>
                  <input matInput name="systolic" type="number" [(ngModel)]="newVital.systolic" required>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Presión arterial (diastólica)</mat-label>
                  <input matInput name="diastolic" type="number" [(ngModel)]="newVital.diastolic" required>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Temperatura (°C)</mat-label>
                  <input matInput name="temperature" type="number" step="0.1" [(ngModel)]="newVital.temperature" required>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Frecuencia cardíaca (lpm)</mat-label>
                  <input matInput name="heartRate" type="number" [(ngModel)]="newVital.heartRate" required>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Glucosa (mg/dL)</mat-label>
                  <input matInput name="glucose" type="number" [(ngModel)]="newVital.glucose" required>
                </mat-form-field>
              </form>
            </mat-card-content>
            <mat-card-actions style="justify-content: center;">
              <button mat-button color="primary" (click)="saveVital()" [disabled]="!vitalForm.form.valid">
                <mat-icon>save</mat-icon>
                Guardar Signos Vitales
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      padding: 20px;
      margin: 0 auto;
      max-width: 1200px;
    }
    .header-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .back-button {
      margin: 0;
    }
    .pdf-button {
      margin: 0;
    }
    .patient-detail-container {
      display: flex;
      flex-direction: column;
    }
    .section {
      margin-bottom: 20px;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
    @media (min-width: 768px) {
      .patient-detail-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        align-items: start;
      }
      .column {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    }
    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .vital-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid #ccc;
    }
    .vital-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .vital-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .vital-icon {
      margin-right: 8px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .vital-type {
      font-weight: 500;
      font-size: 14px;
      color: #666;
    }
    .vital-value {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .vital-timestamp {
      font-size: 12px;
      color: #999;
    }
    .vital-pressure {
      border-left-color: #1976d2;
    }
    .vital-pressure .vital-icon {
      color: #1976d2;
    }
    .vital-temp {
      border-left-color: #ff9800;
    }
    .vital-temp .vital-icon {
      color: #ff9800;
    }
    .vital-heart-rate {
      border-left-color: #4caf50;
    }
    .vital-heart-rate .vital-icon {
      color: #4caf50;
    }
    .vital-glucose {
      border-left-color: #9c27b0;
    }
    .vital-glucose .vital-icon {
      color: #9c27b0;
    }
    .no-vitals {
      text-align: center;
      color: #999;
      font-style: italic;
    }
    button {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }
    .charts-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .chart-container {
      height: 300px;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: any;
  vitals: any[] = [];
  nurses: any[] = [];
  newNote = '';
  selectedNurse = '';
  newVital = {
    systolic: null,
    diastolic: null,
    temperature: null,
    heartRate: null,
    glucose: null
  };
  chartDataPressure: ChartData<'line'> = { datasets: [] };
  chartDataTemp: ChartData<'line'> = { datasets: [] };
  chartDataHeartRate: ChartData<'line'> = { datasets: [] };
  chartDataGlucose: ChartData<'line'> = { datasets: [] };
  @ViewChild('chartsContent', { static: false }) chartsContent!: ElementRef;
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'dd/MM',
          },
        },
        title: {
          display: true,
          text: 'Fecha',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valor',
        },
        beginAtZero: true,
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private vitalService: VitalService,
    private nurseService: NurseService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private chatService: ChatService
  ) {
    // Register the time scale
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables, TimeScale);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientService.getPatient(id).subscribe(data => {
        this.patient = data;
      });
      this.vitalService.getVitals(id).subscribe(data => {
        this.vitals = data;
        this.prepareChartData();
      });
    }
    this.loadNurses();
    // Connect to chat when component initializes
    this.connectToChat();
    // Auto-select current nurse if logged in as nurse
    const user = this.authService.getUser();
    if (user && user.roles && user.roles.includes('NURSE')) {
      this.selectedNurse = user._id;
    }
  }

  connectToChat() {
    this.chatService.connect();
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(data => this.nurses = data);
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

  getAssignedNurses(): string {
    if (!this.patient?.assignedNurses) return 'Ninguno';
    return this.patient.assignedNurses.map((n: any) => n.name).join(', ');
  }

  getVitalClass(type: string): string {
    switch (type) {
      case 'pressure': return 'vital-pressure';
      case 'temp': return 'vital-temp';
      case 'heartRate': return 'vital-heart-rate';
      case 'glucose': return 'vital-glucose';
      default: return '';
    }
  }

  getVitalIcon(type: string): string {
    switch (type) {
      case 'pressure': return 'favorite';
      case 'temp': return 'thermostat';
      case 'heartRate': return 'monitor_heart';
      case 'glucose': return 'bloodtype';
      default: return 'monitor_heart';
    }
  }

  getVitalLabel(type: string): string {
    switch (type) {
      case 'pressure': return 'Presión Arterial';
      case 'temp': return 'Temperatura';
      case 'heartRate': return 'Frecuencia Cardíaca';
      case 'glucose': return 'Glucosa';
      default: return type;
    }
  }

  getVitalDisplayValue(vital: any): string {
    if (vital.type === 'pressure') {
      return `${vital.value.systolic}/${vital.value.diastolic} mmHg`;
    } else {
      return `${vital.value} ${vital.unit || ''}`;
    }
  }

  addNote() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.newNote && this.selectedNurse) {
      const noteData = {
        note: this.newNote,
        nurseId: this.selectedNurse
      };
      this.patientService.addHistoryNote(id, noteData.note, noteData.nurseId).subscribe(() => {
        this.snackBar.open('Nota agregada exitosamente', 'Cerrar', { duration: 3000 });
        this.newNote = '';
        this.selectedNurse = '';
        // Reload patient to show new history
        this.patientService.getPatient(id).subscribe(data => this.patient = data);
      });
    }
  }

  saveVital() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBar.open('Paciente no encontrado', 'Cerrar', { duration: 3000 });
      return;
    }
    const vitals = [
      { type: 'pressure', value: { systolic: this.newVital.systolic, diastolic: this.newVital.diastolic }, unit: 'mmHg' },
      { type: 'temp', value: this.newVital.temperature, unit: '°C' },
      { type: 'heartRate', value: this.newVital.heartRate, unit: 'lpm' },
      { type: 'glucose', value: this.newVital.glucose, unit: 'mg/dL' }
    ];

    let savedCount = 0;
    let hasError = false;

    vitals.forEach((vital: any) => {
      vital.patientId = id; // Add patientId to each vital
      this.vitalService.addVital(vital).subscribe({
        next: () => {
          savedCount++;
          if (savedCount === vitals.length && !hasError) {
            this.snackBar.open('Signos vitales guardados exitosamente', 'Cerrar', { duration: 3000 });
            this.vitalService.getVitals(id).subscribe(data => {
              this.vitals = data;
              this.prepareChartData();
            });
            this.newVital = { systolic: null, diastolic: null, temperature: null, heartRate: null, glucose: null };
          }
        },
        error: () => {
          if (!hasError) {
            hasError = true;
            this.snackBar.open('Error al guardar los registros vitales', 'Cerrar', { duration: 3000 });
          }
        }
      });
    });
  }

  prepareChartData() {
    if (!this.vitals || this.vitals.length === 0) {
      this.chartDataPressure = { datasets: [] };
      this.chartDataTemp = { datasets: [] };
      this.chartDataHeartRate = { datasets: [] };
      this.chartDataGlucose = { datasets: [] };
      return;
    }

    // Group vitals by type
    const groupedVitals: { [key: string]: any[] } = {};
    this.vitals.forEach(vital => {
      if (!groupedVitals[vital.type]) {
        groupedVitals[vital.type] = [];
      }
      groupedVitals[vital.type].push(vital);
    });

    const colors = {
      pressure: '#1976d2',
      temp: '#ff9800',
      heartRate: '#4caf50',
      glucose: '#9c27b0'
    };

    // Prepare data for each chart
    Object.keys(groupedVitals).forEach(type => {
      const vitalsForType = groupedVitals[type].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

      if (type === 'pressure') {
        const systolicData = vitalsForType.map(vital => ({
          x: new Date(vital.recordedAt),
          y: vital.value.systolic
        }));
        const diastolicData = vitalsForType.map(vital => ({
          x: new Date(vital.recordedAt),
          y: vital.value.diastolic
        }));

        const systolicDataset: any = {
          label: 'Sistólica',
          data: systolicData,
          borderColor: colors.pressure,
          backgroundColor: colors.pressure + '20',
          fill: false,
          tension: 0.1
        };
        const diastolicDataset: any = {
          label: 'Diastólica',
          data: diastolicData,
          borderColor: '#0d47a1', // Darker blue for diastolic
          backgroundColor: '#0d47a1' + '20',
          fill: false,
          tension: 0.1
        };

        this.chartDataPressure = { datasets: [systolicDataset, diastolicDataset] };
      } else {
        const data = vitalsForType.map(vital => ({
          x: new Date(vital.recordedAt),
          y: vital.value
        }));

        const dataset: any = {
          label: this.getVitalLabel(type),
          data: data,
          borderColor: colors[type as keyof typeof colors],
          backgroundColor: colors[type as keyof typeof colors] + '20',
          fill: false,
          tension: 0.1
        };

        switch (type) {
          case 'temp':
            this.chartDataTemp = { datasets: [dataset] };
            break;
          case 'heartRate':
            this.chartDataHeartRate = { datasets: [dataset] };
            break;
          case 'glucose':
            this.chartDataGlucose = { datasets: [dataset] };
            break;
        }
      }
    });
  }

  async generatePDF() {
    if (!this.patient) {
      this.snackBar.open('Paciente no cargado', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); // Set font to bold
    doc.setFontSize(22); // Increase font size
    doc.text('Sistema de Gestión de Pacientes', pageWidth / 2, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal'); // Reset font to normal
    yPosition = 40;

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16); // Further decreased font size
    const reportTitle = `Reporte general de ${this.patient.name}`;
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // --- Patient Info Section ---
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Paciente', pageWidth / 2, yPosition, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const patientInfo = [
      `Nombre: ${this.patient.name}`,
      `Edad: ${this.calculateAge(this.patient.birthDate)} años`,
      `Tipo de Alta: ${this.patient.dischargeType}`,
      `Enfermeros Asignados: ${this.getAssignedNurses()}`
    ];
    patientInfo.forEach(info => {
      doc.text(info, 15, yPosition);
      yPosition += 7;
    });

    yPosition += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Clínico:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    const clinicalSummary = this.patient.clinicalSummary;
    const summaryLines = doc.splitTextToSize(clinicalSummary, pageWidth - 30);
    doc.text(summaryLines, 15, yPosition, { align: 'justify', maxWidth: pageWidth - 30 });
    yPosition += summaryLines.length * 5 + 10;

    // --- Latest Vitals Section ---
    if (this.vitals && this.vitals.length > 0) {
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(33, 150, 243);
        doc.setFont('helvetica', 'bold');
        doc.text('Últimos Signos Vitales Registrados', pageWidth / 2, yPosition, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        yPosition += 10;

        const groupedVitals: { [key: string]: any[] } = {};
        this.vitals.forEach(vital => {
            if (!groupedVitals[vital.type]) {
                groupedVitals[vital.type] = [];
            }
            groupedVitals[vital.type].push(vital);
        });

        const latestVitals: any[] = [];
        Object.keys(groupedVitals).forEach(type => {
            const vitalsForType = groupedVitals[type];
            const latestVital = vitalsForType.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
            if (latestVital) {
                latestVitals.push(latestVital);
            }
        });

        const colors = {
            pressure: '#1976d2',
            temp: '#ff9800',
            heartRate: '#4caf50',
            glucose: '#9c27b0'
        };

        const cardWidth = (pageWidth - 45) / 2;
        const cardHeight = 25;
        let xPosition = 15;
        let cardCount = 0;

        latestVitals.forEach(vital => {
            const color = colors[vital.type as keyof typeof colors] || '#ccc';

            doc.setDrawColor(200);
            doc.setFillColor(249, 249, 249);
            doc.roundedRect(xPosition, yPosition, cardWidth, cardHeight, 3, 3, 'FD');

            doc.setFillColor(color);
            doc.rect(xPosition, yPosition + 3, 3, cardHeight - 6, 'F');

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'bold');
            doc.text(this.getVitalLabel(vital.type), xPosition + 8, yPosition + 8);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text(this.getVitalDisplayValue(vital), xPosition + 8, yPosition + 16);

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date(vital.recordedAt).toLocaleString(), xPosition + 8, yPosition + 22);

            cardCount++;
            if (cardCount % 2 === 0) {
                xPosition = 15;
                yPosition += cardHeight + 5;
            } else {
                xPosition += cardWidth + 15;
            }
        });

        if (cardCount % 2 !== 0) {
            yPosition += cardHeight + 10;
        }
    }

    // --- Charts & History Page ---
    doc.addPage();
    yPosition = 20;
    
    // --- Title for the page ---
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Evolución y Comentarios', pageWidth / 2, yPosition, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    yPosition += 15;

    // --- TOP HALF: Charts Section (2x2 Grid) ---
    const chartsTop = yPosition;
    const chartsHeight = 120; // Allocate 120mm for the charts section
    if (this.chartsContent) {
      const chartElements = this.chartsContent.nativeElement.querySelectorAll('.chart-container');
      if (chartElements.length > 0) {
        try {
          const margin = 10;
          const gutter = 10;
          const availableWidth = pageWidth - (margin * 2);
          
          const chartCellHeight = (chartsHeight - gutter) / 2;
          const chartCellWidth = (availableWidth - gutter) / 2;

          let chartIndex = 0;
          for (const elem of chartElements) {
            const canvas = await html2canvas(elem, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            
            const row = Math.floor(chartIndex / 2);
            const col = chartIndex % 2;

            const x = margin + col * (chartCellWidth + gutter);
            const y = chartsTop + row * (chartCellHeight + gutter);

            const canvasAspectRatio = canvas.width / canvas.height;
            let imgWidth = chartCellWidth;
            let imgHeight = imgWidth / canvasAspectRatio;

            if (imgHeight > chartCellHeight) {
              imgHeight = chartCellHeight;
              imgWidth = imgHeight * canvasAspectRatio;
            }

            const finalX = x + (chartCellWidth - imgWidth) / 2;
            const finalY = y + (chartCellHeight - imgHeight) / 2;

            doc.addImage(imgData, 'PNG', finalX, finalY, imgWidth, imgHeight);
            chartIndex++;
          }
        } catch (error) {
          console.error('Error generating chart image:', error);
          this.snackBar.open('Error al generar la imagen de los gráficos', 'Cerrar', { duration: 3000 });
        }
      }
    }
    yPosition = chartsTop + chartsHeight + 15; // Set yPosition for the history section

    // --- BOTTOM HALF: History Section ---
    doc.setDrawColor(220);
    doc.line(15, yPosition - 5, pageWidth - 15, yPosition - 5); // Separator line

    const titleY = yPosition + 5; // Add space between line and title

    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Evolución', pageWidth / 2, titleY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    yPosition = titleY + 10;

    if (this.patient.history && this.patient.history.length > 0) {
      this.patient.history.forEach((entry: any) => {
        const noteLines = doc.splitTextToSize(entry.note, pageWidth - 30);
        const entryHeight = 14 + (noteLines.length * 5);
        if (yPosition + entryHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${new Date(entry.date).toLocaleString()} - ${entry.nurse?.name || 'Enfermero'}`, 15, yPosition);
        yPosition += 6;

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(noteLines, 15, yPosition);
        yPosition += noteLines.length * 5 + 8;
        
        doc.setDrawColor(220);
        doc.line(15, yPosition - 4, pageWidth - 15, yPosition - 4);
      });
    } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('No hay notas de evolución.', 15, yPosition);
    }

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Sistema de Gestión de Pacientes - Generado automáticamente', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Save the PDF
    doc.save(`reporte-${this.patient.name.replace(/\s+/g, '_')}.pdf`);
    this.snackBar.open('PDF generado exitosamente', 'Cerrar', { duration: 3000 });
  }
}
