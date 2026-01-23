import { Injectable } from '@angular/core';

/**
 * @deprecated This service is deprecated for OAuth2 flow.
 * 
 * With OAuth2 BFF pattern, tokens are stored in HttpOnly cookies by the backend.
 * This provides better security against XSS attacks.
 * 
 * Use OAuth2AuthService instead for authentication operations.
 * This service is kept for backward compatibility with non-OAuth2 flows.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly storageKey = 'authToken';

  /**
   * @deprecated Use OAuth2AuthService.login() which handles tokens via HttpOnly cookies.
   */
  storeToken(token: string): void {
    console.warn('AuthTokenService.storeToken() is deprecated. Tokens should be managed by OAuth2 BFF.');
    localStorage.setItem(this.storageKey, token);
  }

  /**
   * @deprecated Tokens are now stored in HttpOnly cookies, not accessible from JavaScript.
   */
  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  /**
   * @deprecated Use OAuth2AuthService.logout() which clears HttpOnly cookies server-side.
   */
  clearToken(): void {
    localStorage.removeItem(this.storageKey);
  }
}
