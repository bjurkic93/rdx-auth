import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginService } from './login.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly loginService = inject(LoginService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  
  // External redirect URL (e.g., rdx-video-cms)
  returnUrl = environment.postLoginRedirectUrl;

  readonly loginForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this.fb.nonNullable.control(true)
  });

  ngOnInit(): void {
    // Get email from query params (e.g., after registration)
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.loginForm.controls.email.setValue(emailFromQuery);
    }

    // Get return URL from query params (allows override from external apps)
    // Support both 'returnUrl' and OAuth2 standard 'redirect_uri'
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') 
                   || this.route.snapshot.queryParamMap.get('redirect_uri');
    if (returnUrl) {
      this.returnUrl = returnUrl;
    }

    // Show verification success message from state
    const verifiedMessage = history.state?.verifiedMessage;
    if (verifiedMessage) {
      this.successMessage = verifiedMessage;
    }

    // Show session expired error from query params
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error === 'session_expired') {
      this.errorMessage = 'Your session has expired. Please sign in again.';
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();

    this.loginService
      .login({ email, password })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.accessToken) {
            // Redirect to external app with token in URL fragment
            // Using fragment (#) instead of query param for security (not sent to server)
            const redirectUrl = this.buildRedirectUrl(response.accessToken, response.refreshToken);
            window.location.href = redirectUrl;
          } else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          const message =
            error?.error?.errorMessage ?? 'We could not sign you in right now. Please try again.';
          this.errorMessage = message;
        }
      });
  }

  /**
   * Build redirect URL with tokens in hash fragment.
   * Redirects to the /callback route which handles token storage.
   */
  private buildRedirectUrl(accessToken: string, refreshToken: string): string {
    // Parse the returnUrl to get the base
    let baseUrl = this.returnUrl.split('#')[0].split('?')[0]; // Remove fragment and query
    
    // Ensure we redirect to the /callback route
    if (!baseUrl.endsWith('/callback')) {
      // Remove trailing slash if present
      baseUrl = baseUrl.replace(/\/$/, '');
      baseUrl = `${baseUrl}/callback`;
    }
    
    const tokenData = encodeURIComponent(JSON.stringify({
      accessToken,
      refreshToken
    }));
    return `${baseUrl}#token=${tokenData}`;
  }
}
