import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthTokenService } from '../auth-token.service';
import { CreatePasswordService } from './create-password.service';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.less'
})
export class CreatePasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly createPasswordService = inject(CreatePasswordService);
  private readonly authTokenService = inject(AuthTokenService);

  email = '';
  verificationToken = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  passwordsMismatch = false;

  readonly passwordForm = this.fb.nonNullable.group({
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)])
  });

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.verificationToken = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.verificationToken || !this.email) {
      this.errorMessage = 'Your verification link is missing details. Please verify your email again.';
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordsMismatch = false;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (!this.email || !this.verificationToken) {
      this.errorMessage = 'Verification details expired. Please restart email verification.';
      return;
    }

    const { password, confirmPassword } = this.passwordForm.getRawValue();
    if (password !== confirmPassword) {
      this.passwordsMismatch = true;
      return;
    }

    this.isSubmitting = true;

    this.createPasswordService
      .createPassword({
        email: this.email,
        password,
        verificationToken: this.verificationToken
      })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: ({ token }) => {
          if (!token) {
            this.errorMessage =
              'We created your password, but could not complete sign in. Please try again.';
            return;
          }

          this.authTokenService.storeToken(token);

          const message = 'Password created successfully. You can now sign in.';
          this.successMessage = message;
          this.passwordForm.reset();
          void this.router.navigate(['/login'], {
            queryParams: { email: this.email },
            state: { verifiedMessage: message }
          });
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not save your password right now. Please try again in a moment.';
          this.errorMessage = message;
        }
      });
  }
}
