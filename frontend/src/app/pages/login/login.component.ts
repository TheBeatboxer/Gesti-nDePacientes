import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="header-content">
            <div class="header-logo">
              <mat-icon class="logo-icon">local_hospital</mat-icon>
            </div>
            <mat-card-title>Iniciar Sesión</mat-card-title>
            <mat-card-subtitle>Sistema de Información Médica</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="role-selection">
            <mat-card class="role-card" (click)="selectRole('NURSE')" [class.selected]="selectedRole === 'NURSE'">
              <mat-icon>local_hospital</mat-icon>
              <h3>Enfermera</h3>
            </mat-card>
            <mat-card class="role-card" (click)="selectRole('PATIENT')" [class.selected]="selectedRole === 'PATIENT'">
              <mat-icon>person</mat-icon>
              <h3>Paciente</h3>
            </mat-card>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email es requerido</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Email inválido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" type="password" />
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Contraseña es requerida</mat-error>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="loginForm.invalid || !selectedRole || loading">
              <mat-icon *ngIf="!loading">login</mat-icon>
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              Entrar
            </button>
          </form>
          <div class="admin-access">
            <button mat-button (click)="goToAdminLogin()">
              <mat-icon>admin_panel_settings</mat-icon>
              Acceso Administrador
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, var(--medical-primary) 0%, var(--medical-secondary) 100%);
      padding: 20px;
      overflow: hidden;
    }
    .login-card {
      width: 100%;
      max-width: 500px;
      margin: 20px;
      background-color: var(--medical-surface);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    .role-selection {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .role-card {
      cursor: pointer;
      padding: 20px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      min-width: 110px;
      flex: 1;
      max-width: 140px;
    }
    .role-card:hover {
      border-color: var(--medical-primary);
      transform: translateY(-2px);
    }
    .role-card.selected {
      border-color: var(--medical-primary);
      background-color: rgba(33, 150, 243, 0.1);
    }
    .role-card mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: var(--medical-primary);
    }
    .role-card h3 {
      margin: 10px 0 0 0;
      color: var(--medical-text-primary);
      font-size: 1.1rem;
    }
    .full-width {
      width: 100%;
    }
    mat-card-header {
      position: relative;
      padding: 60px 0 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-align: center;
    }
    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .header-logo {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
    }
    .logo-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: var(--medical-primary);
    }
    mat-card-title {
      font-size: 1.5rem;
      color: var(--medical-primary);
      margin: 0;
    }
    mat-card-subtitle {
      color: var(--medical-text-secondary);
    }
    .admin-access {
      text-align: center;
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    CommonModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  selectedRole: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  selectRole(role: string) {
    this.selectedRole = role;
    this.loginForm.reset();
  }

  submit() {
    if (this.loginForm.valid && this.selectedRole) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          this.loading = false;
          // Validate that user has the selected role
          if (this.auth.hasRole(this.selectedRole!)) {
            // Redirection is handled by AuthService based on user role
          } else {
            this.auth.logout();
            this.snackBar.open(`No tienes permisos para acceder como ${this.selectedRole}.`, 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error en el login. Verifica tus credenciales.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }
}
