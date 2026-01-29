import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * OAuth2 Authorization request - sent to /auth/authorize
 */
export interface AuthorizeRequest {
  email: string;
  password: string;
  responseType: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

/**
 * OAuth2 Authorization response - returns authorization code
 */
export interface AuthorizeResponse {
  code: string;
  state: string;
  redirectUrl: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  /**
   * Authorize using OAuth2 Authorization Code flow.
   * Returns an authorization code that the client exchanges for tokens.
   * 
   * @param request OAuth2 authorize request with credentials
   * @returns Observable with authorization code
   */
  authorize(request: AuthorizeRequest): Observable<AuthorizeResponse> {
    return this.http.post<AuthorizeResponse>(
      `${this.apiBaseUrl}/auth/authorize`,
      request
    );
  }
}
