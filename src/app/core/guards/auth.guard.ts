import { Injectable, inject } from '@angular/core';
import { 
  CanActivate, 
  CanActivateFn,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, map, catchError, of, take } from 'rxjs';
import { OAuth2AuthService } from '../services/oauth2-auth.service';

/**
 * Auth Guard (Class-based)
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly authService = inject(OAuth2AuthService);
  private readonly router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.checkStatus().pipe(
      map(status => {
        if (status.authenticated) {
          return true;
        }
        // Store the attempted URL for redirecting after login
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      }),
      catchError(() => {
        // On error, redirect to login
        return of(this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      })
    );
  }
}

/**
 * Auth Guard (Functional)
 * 
 * Modern functional guard for Angular 15+.
 * Usage: { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(OAuth2AuthService);
  const router = inject(Router);

  return authService.checkStatus().pipe(
    take(1),
    map(status => {
      if (status.authenticated) {
        return true;
      }
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      }));
    })
  );
};

/**
 * Role Guard (Functional)
 * 
 * Protects routes that require specific roles.
 * Usage: { path: 'admin', component: AdminComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] }
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> => {
    const authService = inject(OAuth2AuthService);
    const router = inject(Router);

    return authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          });
        }

        if (authService.hasAnyRole(requiredRoles)) {
          return true;
        }

        // User is authenticated but doesn't have required role
        return router.createUrlTree(['/unauthorized']);
      }),
      catchError(() => {
        return of(router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      })
    );
  };
};

/**
 * No Auth Guard (Functional)
 * 
 * Prevents authenticated users from accessing certain routes (e.g., login page).
 * Usage: { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] }
 */
export const noAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(OAuth2AuthService);
  const router = inject(Router);

  return authService.checkStatus().pipe(
    take(1),
    map(status => {
      if (!status.authenticated) {
        return true;
      }
      // User is already authenticated, redirect to dashboard
      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => {
      // On error, allow access (assume not authenticated)
      return of(true);
    })
  );
};
