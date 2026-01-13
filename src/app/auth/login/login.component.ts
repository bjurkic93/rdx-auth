import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthTokenService } from '../auth-token.service';
import { LoginService } from './login.service';

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
  private readonly authTokenService = inject(AuthTokenService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this.fb.nonNullable.control(true)
  });

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.loginForm.controls.email.setValue(emailFromQuery);
    }

    const verifiedMessage = history.state?.verifiedMessage;
    if (verifiedMessage) {
      this.successMessage = verifiedMessage;
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
        next: ({ token }) => {
          if (token) {
            this.authTokenService.storeToken(token);
          }
          this.successMessage = 'Signed in successfully.';
        },
        error: (error) => {
          const message =
            error?.error?.message ?? 'We could not sign you in right now. Please try again.';
          this.errorMessage = message;
        }
      });
  }
}
