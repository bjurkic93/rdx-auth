import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmailService } from '../register/email.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.less'
})
export class EmailVerificationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly emailService = inject(EmailService);

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
    ])
  });

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.resendMessage = '';

    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    const { email, verificationCode } = this.verificationForm.getRawValue();

    this.isSubmitting = true;

    this.emailService
      .verifyEmailCode(email, verificationCode)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Email verified successfully. You can now sign in.';
          this.verificationForm.reset();
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not verify your email right now. Please check the code and try again.';
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
