import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Unauthorized Component
 * 
 * Displayed when a user attempts to access a resource they don't have permission for.
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="unauthorized">
      <div class="unauthorized__card">
        <div class="unauthorized__icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this resource.</p>
        <p class="unauthorized__hint">
          If you believe this is a mistake, please contact your administrator.
        </p>
        <div class="unauthorized__actions">
          <a routerLink="/dashboard" class="button">Go to Dashboard</a>
          <a routerLink="/login" class="button button--secondary">Sign In</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .unauthorized {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .unauthorized__card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 3rem;
      text-align: center;
      max-width: 450px;
    }

    .unauthorized__icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0 0 0.5rem;
      color: #1a1a2e;
    }

    p {
      color: #666;
      margin: 0 0 1rem;
    }

    .unauthorized__hint {
      font-size: 0.875rem;
      color: #888;
    }

    .unauthorized__actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .button {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      background: #667eea;
      color: white;
    }

    .button:hover {
      background: #5a6fd6;
    }

    .button--secondary {
      background: #f5f5f5;
      color: #333;
    }

    .button--secondary:hover {
      background: #e8e8e8;
    }
  `]
})
export class UnauthorizedComponent {}
