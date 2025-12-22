import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PhoneVerificationService } from './phone-verification.service';

@Component({
  selector: 'app-phone-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './phone-verification.component.html',
  styleUrl: './phone-verification.component.less'
})
export class PhoneVerificationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly phoneVerificationService = inject(PhoneVerificationService);

  isSubmitting = false;
  isResending = false;
  successMessage = '';
  errorMessage = '';
  resendMessage = '';

  readonly verificationForm = this.fb.nonNullable.group({
    phoneCountryCode: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[+][0-9]{1,4}$/)
    ]),
    phoneNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[0-9]{6,15}$/)
    ]),
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

    const { phoneCountryCode, phoneNumber, verificationCode } = this.verificationForm.getRawValue();

    this.isSubmitting = true;

    this.phoneVerificationService
      .verifyPhoneCode(phoneCountryCode, phoneNumber, verificationCode)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Phone verified successfully. You can now sign in.';
          this.verificationForm.reset();
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not verify your phone right now. Please check the code and try again.';
          this.errorMessage = message;
        }
      });
  }

  resendCode(): void {
    this.resendMessage = '';
    this.errorMessage = '';
    this.successMessage = '';

    const { phoneCountryCode, phoneNumber } = this.verificationForm.controls;
    if (phoneCountryCode.invalid || phoneNumber.invalid) {
      phoneCountryCode.markAsTouched();
      phoneNumber.markAsTouched();
      return;
    }

    this.isResending = true;

    this.phoneVerificationService
      .sendVerificationCode(phoneCountryCode.value, phoneNumber.value)
      .pipe(
        finalize(() => {
          this.isResending = false;
        })
      )
      .subscribe({
        next: () => {
          this.resendMessage = 'Verification code sent. Check your messages for the latest code.';
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
