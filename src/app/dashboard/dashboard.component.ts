import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OAuth2AuthService, UserInfo } from '../core/services/oauth2-auth.service';

/**
 * Dashboard Component
 * 
 * Protected page that displays user information and provides logout functionality.
 * This demonstrates the OAuth2 BFF flow working end-to-end.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="dashboard">
      <div class="dashboard__card">
        <header class="dashboard__header">
          <img
            class="dashboard__logo"
            src="https://static.wixstatic.com/media/39eefc_626500717c344fe8969174cc515e68d4~mv2.png/v1/fill/w_211,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/rdx-logo-final.png"
            alt="RDX"
          />
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! You're authenticated.</p>
          </div>
        </header>

        <div class="dashboard__content" *ngIf="!isLoading; else loadingTemplate">
          <div class="user-info" *ngIf="currentUser">
            <h2>User Information</h2>
            
            <div class="info-grid">
              <div class="info-item">
                <label>User ID</label>
                <span>{{ currentUser.sub }}</span>
              </div>
              
              <div class="info-item">
                <label>Email</label>
                <span>{{ currentUser.email }}</span>
              </div>
              
              <div class="info-item" *ngIf="currentUser.givenName || currentUser.familyName">
                <label>Name</label>
                <span>{{ userFullName }}</span>
              </div>
              
              <div class="info-item">
                <label>Roles</label>
                <div class="roles">
                  <span class="role" *ngFor="let role of currentUser.roles">
                    {{ role }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="button button--secondary" (click)="refreshUserInfo()">
              Refresh User Info
            </button>
            <button class="button button--danger" (click)="logout()" [disabled]="isLoggingOut">
              {{ isLoggingOut ? 'Signing out...' : 'Sign out' }}
            </button>
          </div>
        </div>

        <ng-template #loadingTemplate>
          <div class="loading">
            <p>Loading user information...</p>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .dashboard__card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 2.5rem;
      width: 100%;
      max-width: 600px;
    }

    .dashboard__header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .dashboard__logo {
      width: 80px;
      height: auto;
    }

    .dashboard__header h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      color: #1a1a2e;
    }

    .dashboard__header p {
      margin: 0;
      color: #666;
    }

    .user-info h2 {
      font-size: 1.25rem;
      color: #1a1a2e;
      margin: 0 0 1.5rem;
    }

    .info-grid {
      display: grid;
      gap: 1.25rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #888;
    }

    .info-item span {
      font-size: 1rem;
      color: #333;
    }

    .roles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .role {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #e8f4fd;
      color: #1976d2;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .actions {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .button--secondary {
      background: #f5f5f5;
      color: #333;
    }

    .button--secondary:hover:not(:disabled) {
      background: #e8e8e8;
    }

    .button--danger {
      background: #dc3545;
      color: white;
    }

    .button--danger:hover:not(:disabled) {
      background: #c82333;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(OAuth2AuthService);
  private readonly router = inject(Router);

  currentUser: UserInfo | null = null;
  userFullName = '';
  isLoading = true;
  isLoggingOut = false;

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.isLoading = true;
    
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.userFullName = [user.givenName, user.familyName].filter(Boolean).join(' ');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load user info:', error);
        this.isLoading = false;
        // If we can't get user info, the auth guard or interceptor will handle redirect
      }
    });
  }

  refreshUserInfo(): void {
    this.loadUserInfo();
  }

  logout(): void {
    this.isLoggingOut = true;
    
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even on error, redirect to login (cookies should be cleared)
        this.router.navigate(['/login']);
      }
    });
  }
}
