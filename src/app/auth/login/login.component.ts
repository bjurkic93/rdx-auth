import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginService, AuthorizeRequest } from './login.service';

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
  
  // OAuth2 parameters from query string
  private clientId = '';
  private redirectUri = '';
  private scope = 'openid profile email';
  private state = '';
  private codeChallenge = '';
  private codeChallengeMethod = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this.fb.nonNullable.control(true)
  });

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    
    // Get OAuth2 parameters from query string
    this.clientId = queryParams.get('client_id') || '';
    this.redirectUri = queryParams.get('redirect_uri') || '';
    this.scope = queryParams.get('scope') || 'openid profile email';
    this.state = queryParams.get('state') || '';
    this.codeChallenge = queryParams.get('code_challenge') || '';
    this.codeChallengeMethod = queryParams.get('code_challenge_method') || '';

    // Validate required OAuth2 parameters
    if (!this.clientId || !this.redirectUri) {
      this.errorMessage = 'Missing required OAuth2 parameters (client_id, redirect_uri)';
    }

    // Get email from query params (e.g., after registration)
    const emailFromQuery = queryParams.get('email');
    if (emailFromQuery) {
      this.loginForm.controls.email.setValue(emailFromQuery);
    }

    // Show verification success message from state
    const verifiedMessage = history.state?.verifiedMessage;
    if (verifiedMessage) {
      this.successMessage = verifiedMessage;
    }

    // Show session expired error from query params
    const error = queryParams.get('error');
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

    // Validate OAuth2 parameters
    if (!this.clientId || !this.redirectUri) {
      this.errorMessage = 'Missing required OAuth2 parameters';
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();

    const authorizeRequest: AuthorizeRequest = {
      email,
      password,
      responseType: 'code',
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      scope: this.scope,
      state: this.state,
      codeChallenge: this.codeChallenge || undefined,
      codeChallengeMethod: this.codeChallengeMethod || undefined
    };

    this.loginService
      .authorize(authorizeRequest)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Redirect to client with authorization code
          const redirectUrl = this.buildRedirectUrl(response.code, response.state);
          window.location.href = redirectUrl;
        },
        error: (error) => {
          const message =
            error?.error?.errorMessage ?? 'We could not sign you in right now. Please try again.';
          this.errorMessage = message;
        }
      });
  }

  /**
   * Build redirect URL with authorization code.
   */
  private buildRedirectUrl(code: string, state: string): string {
    const url = new URL(this.redirectUri);
    url.searchParams.set('code', code);
    if (state) {
      url.searchParams.set('state', state);
    }
    return url.toString();
  }
}
