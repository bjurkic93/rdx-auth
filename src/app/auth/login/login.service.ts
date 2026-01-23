import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Login response from BFF.
 * Tokens are returned in response body for localStorage storage.
 */
export type LoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

// Token storage keys
const ACCESS_TOKEN_KEY = 'rdx_access_token';
const REFRESH_TOKEN_KEY = 'rdx_refresh_token';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /**
   * Login using BFF endpoint.
   * Stores tokens in localStorage upon successful login.
   * 
   * @param payload Email and password
   * @returns Observable with tokens
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiBaseUrl}/auth/login`,
      payload
    ).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.storeTokens(response.accessToken, response.refreshToken);
        }
      })
    );
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
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
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
