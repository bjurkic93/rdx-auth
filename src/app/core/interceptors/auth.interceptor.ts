import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuth2AuthService } from '../services/oauth2-auth.service';

/**
 * Auth Interceptor for rdx-auith.
 * 
 * Responsibilities:
 * 1. Add Authorization header with Bearer token to all requests
 * 2. Handle 401 errors by attempting token refresh
 * 3. Queue requests during token refresh
 * 4. Redirect to login if refresh fails
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly authService = inject(OAuth2AuthService);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

  // Endpoints that should not trigger token refresh on 401
  private readonly noRefreshUrls = [
    '/auth/authorize',
    '/auth/refresh',
    '/auth/logout'
  ];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add Authorization header if we have a token
    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.shouldSkipRefresh(req.url)) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.authService.getAccessToken();
    if (token) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return req;
  }

  /**
   * Check if this URL should skip token refresh logic.
   */
  private shouldSkipRefresh(url: string): boolean {
    return this.noRefreshUrls.some(noRefreshUrl => url.includes(noRefreshUrl));
  }

  /**
   * Handle 401 Unauthorized errors.
   * Attempts to refresh the token and retry the request.
   */
  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          // Retry the original request with new token
          return next.handle(this.addAuthHeader(request));
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          
          // Refresh failed - clear tokens and redirect to login
          this.authService.clearTokens();
          this.router.navigate(['/login'], {
            queryParams: { 
              returnUrl: this.router.url,
              error: 'session_expired' 
            }
          });
          
          return throwError(() => refreshError);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Token refresh in progress - wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap((success) => {
          if (success) {
            // Refresh succeeded - retry the request with new token
            return next.handle(this.addAuthHeader(request));
          } else {
            // Refresh failed - throw error
            return throwError(() => new Error('Token refresh failed'));
          }
        })
      );
    }
  }
}

/**
 * Provider for the Auth Interceptor.
 * Use this in app.config.ts providers array.
 */
export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
