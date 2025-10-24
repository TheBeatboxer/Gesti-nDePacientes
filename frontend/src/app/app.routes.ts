import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { NursesComponent } from './pages/nurses/nurses.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { NurseDashboardComponent } from './pages/nurse-dashboard/nurse-dashboard.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'admin-login', component: AdminLoginComponent, canActivate: [LoginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'nurse-dashboard', component: NurseDashboardComponent, canActivate: [AuthGuard] },
  { path: 'patient-profile', loadComponent: () => import('./pages/patient-profile/patient-profile.component').then(m => m.PatientProfileComponent), canActivate: [AuthGuard], data: { expectedRole: 'PATIENT' } },
  { path: 'patient-education', loadComponent: () => import('./pages/patient-education/patient-education.component').then(m => m.PatientEducationComponent), canActivate: [AuthGuard], data: { expectedRole: 'PATIENT' } },
  { path: 'appointments', loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent), canActivate: [AuthGuard] },
  { path: 'patients', component: PatientsComponent, canActivate: [AuthGuard] },
  { path: 'nurses', component: NursesComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'patient/:id', component: PatientDetailComponent, canActivate: [AuthGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];
