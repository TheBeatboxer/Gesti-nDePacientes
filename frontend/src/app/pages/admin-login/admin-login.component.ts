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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
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
    CommonModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="header-content">
            <div class="header-logo">
              <mat-icon class="logo-icon">local_hospital</mat-icon>
            </div>
            <mat-card-title>Acceso Administrativo</mat-card-title>
            <mat-card-subtitle>Sistema de Gestión de Pacientes</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="role-selection">
            <mat-card class="role-card selected">
              <mat-icon>admin_panel_settings</mat-icon>
              <h3>Administrador</h3>
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
            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="loginForm.invalid || loading">
              <mat-icon *ngIf="!loading">login</mat-icon>
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              Entrar
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, var(--medical-primary) 0%, var(--medical-secondary) 100%);
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      margin: 20px;
      background-color: var(--medical-surface);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
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
    .role-selection {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .role-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      margin: 10px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
      background-color: var(--medical-surface);
      border: 2px solid transparent;
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
      margin-bottom: 10px;
    }
    .role-card h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--medical-text-primary);
      text-align: center;
    }
  `]
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  loading = false;

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

  submit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          this.loading = false;
          // Validate that user has ADMIN role
          if (this.auth.hasRole('ADMIN')) {
            // Redirection is handled by AuthService based on user role
          } else {
            this.auth.logout();
            this.snackBar.open('No tienes permisos administrativos.', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error en el login administrativo. Verifica tus credenciales.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
