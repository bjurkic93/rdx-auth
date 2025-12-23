import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmailService } from '../register/email.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.less'
})
export class EmailVerificationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isSubmitting = false;
  isResending = false;
  successMessage = '';
  errorMessage = '';
  resendMessage = '';

  readonly verificationForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    verificationCode: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[0-9]{4,8}$/)
    ]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.nonNullable.control('', [Validators.required])
  });

  get passwordsMismatch(): boolean {
    const { password, confirmPassword } = this.verificationForm.controls;
    return confirmPassword.touched && password.value !== confirmPassword.value;
  }

  markPasswordsAsTouched(): void {
    this.verificationForm.controls.password.markAsTouched();
    this.verificationForm.controls.confirmPassword.markAsTouched();
  }

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.verificationForm.controls.email.setValue(emailFromQuery);
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.resendMessage = '';

    if (this.verificationForm.invalid || this.passwordsMismatch) {
      this.verificationForm.markAllAsTouched();
      this.markPasswordsAsTouched();
      return;
    }

    const { email, verificationCode, password } = this.verificationForm.getRawValue();

    this.isSubmitting = true;

    this.emailService
      .createPassword(email, verificationCode, password)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: ({ token }) => {
          const message = 'Password created successfully. You can now sign in.';
          this.successMessage = `${message} Copy your token for your records: ${token}`;
          void this.router.navigate(['/login'], {
            queryParams: { email },
            state: { verifiedMessage: `${message} Token: ${token}` }
          });
          this.verificationForm.reset();
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not create your password right now. Please check the code and try again.';
          this.errorMessage = message;
        }
      });
  }

  resendCode(): void {
    this.resendMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    const emailControl = this.verificationForm.controls.email;
    if (emailControl.invalid) {
      emailControl.markAsTouched();
      return;
    }

    this.isResending = true;

    this.emailService
      .sendVerificationCode(emailControl.value)
      .pipe(
        finalize(() => {
          this.isResending = false;
        })
      )
      .subscribe({
        next: () => {
          this.resendMessage = 'Verification code sent. Check your inbox for the latest code.';
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not send a new code right now. Please try again in a moment.';
          this.errorMessage = message;
        }
      });
  }
}
