import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="not-found-container">
      <h1>404 - Página No Encontrada</h1>
      <p>La página que buscas no existe o ha sido movida.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">Volver al Dashboard</button>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 80vh;
      text-align: center;
      color: var(--medical-text);
      background-color: var(--medical-background);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      margin: 40px auto;
      max-width: 600px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    p {
      font-size: 1.25rem;
      margin-bottom: 24px;
    }
  `]
})
export class NotFoundComponent {}
