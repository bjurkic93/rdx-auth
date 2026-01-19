import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EmailService } from '../register/email.service';

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

  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  isSubmitting = false;
  isResending = false;
  successMessage = '';
  errorMessage = '';
  resendMessage = '';
  codeInvalid = false;

  readonly verificationForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    digit0: this.fb.nonNullable.control(''),
    digit1: this.fb.nonNullable.control(''),
    digit2: this.fb.nonNullable.control(''),
    digit3: this.fb.nonNullable.control(''),
    digit4: this.fb.nonNullable.control(''),
    digit5: this.fb.nonNullable.control('')
  });

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.verificationForm.controls.email.setValue(emailFromQuery);
    }
  }

  get verificationCode(): string {
    const { digit0, digit1, digit2, digit3, digit4, digit5 } = this.verificationForm.getRawValue();
    return `${digit0}${digit1}${digit2}${digit3}${digit4}${digit5}`;
  }

  get isCodeComplete(): boolean {
    return this.verificationCode.length === 6 && /^[0-9]{6}$/.test(this.verificationCode);
  }

  private readonly digitControls = [
    () => this.verificationForm.controls.digit0,
    () => this.verificationForm.controls.digit1,
    () => this.verificationForm.controls.digit2,
    () => this.verificationForm.controls.digit3,
    () => this.verificationForm.controls.digit4,
    () => this.verificationForm.controls.digit5
  ];

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow single digit
    if (value.length > 1) {
      input.value = value.slice(-1);
      this.digitControls[index]().setValue(value.slice(-1));
    }

    // Auto-focus next input
    if (value && index < 5) {
      const inputs = this.codeInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }

    this.codeInvalid = false;
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    // Handle backspace - go to previous input if current is empty
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const inputs = this.codeInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }

    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const inputs = this.codeInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
    if (event.key === 'ArrowRight' && index < 5) {
      const inputs = this.codeInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onDigitPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    const inputs = this.codeInputs.toArray();
    digits.split('').forEach((digit, i) => {
      if (i < this.digitControls.length) {
        this.digitControls[i]().setValue(digit);
      }
      if (inputs[i]) {
        inputs[i].nativeElement.value = digit;
      }
    });

    // Focus last filled input or the next empty one
    const focusIndex = Math.min(digits.length, 5);
    inputs[focusIndex]?.nativeElement.focus();
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.resendMessage = '';

    if (this.verificationForm.controls.email.invalid) {
      this.verificationForm.controls.email.markAsTouched();
      return;
    }

    if (!this.isCodeComplete) {
      this.codeInvalid = true;
      return;
    }

    const email = this.verificationForm.controls.email.value;
    const verificationCode = this.verificationCode;

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
          const message = 'Email verified successfully. Create your password to finish signing up.';
          this.successMessage = message;
          void this.router.navigate(['/create-password'], {
            queryParams: { email }
          });
          this.verificationForm.reset();
        },
        error: (error) => {
          const message =
            error?.error?.message ??
            'We could not verify your email right now. Please check the code and try again.';
          this.errorMessage = message;
          this.codeInvalid = true;
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
