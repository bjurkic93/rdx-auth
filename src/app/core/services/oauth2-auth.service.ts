import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// Token storage keys (shared with LoginService)
const ACCESS_TOKEN_KEY = 'rdx_access_token';
const REFRESH_TOKEN_KEY = 'rdx_refresh_token';

// Response types
export interface UserInfo {
  sub: string;
  email: string;
  givenName?: string;
  familyName?: string;
  roles: string[];
}

export interface AuthStatus {
  authenticated: boolean;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * OAuth2 Authentication Service for rdx-auith
 * 
 * Uses localStorage for token storage and Authorization header for API calls.
 * This is the auth app - primarily for login/registration.
 */
@Injectable({ providedIn: 'root' })
export class OAuth2AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // Reactive state for current user
  private readonly _currentUser = new BehaviorSubject<UserInfo | null>(null);
  private readonly _isAuthenticated = new BehaviorSubject<boolean>(false);
  private readonly _isLoading = new BehaviorSubject<boolean>(true);

  readonly currentUser$ = this._currentUser.asObservable();
  readonly isAuthenticated$ = this._isAuthenticated.asObservable();
  readonly isLoading$ = this._isLoading.asObservable();

  // Signal-based state
  readonly currentUser = signal<UserInfo | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);

  // Computed signals
  readonly userEmail = computed(() => this.currentUser()?.email ?? '');
  readonly userFullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return [user.givenName, user.familyName].filter(Boolean).join(' ');
  });
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);

  constructor() {
    // Check auth status on service initialization
    this.checkAuthStatus();
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Create Authorization header with Bearer token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Get current user information from the access token.
   */
  getMe(): Observable<UserInfo> {
    return this.http.get<UserInfo>(
      `${this.baseUrl}/auth/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Check if user is authenticated (has valid access token).
   */
  checkStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(
      `${this.baseUrl}/auth/status`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Refresh the access token using the refresh token.
   */
  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshResponse>(
      `${this.baseUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        if (response.accessToken) {
          this.storeTokens(response.accessToken, response.refreshToken);
        }
      })
    );
  }

  /**
   * Logout - clears tokens and revokes refresh token.
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<void>(
      `${this.baseUrl}/auth/logout`,
      { refreshToken }
    ).pipe(
      tap(() => {
        this.clearTokens();
        this.clearAuthState();
      }),
      catchError(() => {
        this.clearTokens();
        this.clearAuthState();
        return of(undefined);
      })
    );
  }

  /**
   * Check authentication status and load user if authenticated.
   */
  checkAuthStatus(): void {
    this._isLoading.next(true);
    this.isLoading.set(true);

    // First check if we have a token
    const token = this.getAccessToken();
    if (!token) {
      this.clearAuthState();
      this._isLoading.next(false);
      this.isLoading.set(false);
      return;
    }

    this.checkStatus().subscribe({
      next: (status) => {
        this._isAuthenticated.next(status.authenticated);
        this.isAuthenticated.set(status.authenticated);
        
        if (status.authenticated) {
          this.loadCurrentUser();
        } else {
          this.clearTokens();
          this.clearAuthState();
          this._isLoading.next(false);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.clearTokens();
        this.clearAuthState();
        this._isLoading.next(false);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load current user information.
   */
  private loadCurrentUser(): void {
    this.getMe().subscribe({
      next: (user) => {
        this._currentUser.next(user);
        this._isAuthenticated.next(true);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this._isLoading.next(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.clearTokens();
        this.clearAuthState();
        this._isLoading.next(false);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Clear all authentication state.
   */
  private clearAuthState(): void {
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Check if user has a specific role.
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Check if user has any of the specified roles.
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Check if user has all of the specified roles.
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }
}
