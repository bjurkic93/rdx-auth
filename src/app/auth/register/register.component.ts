import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, catchError, finalize, switchMap, tap } from 'rxjs';

type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: {
    countryCode: string;
    number: string;
  };
  address: {
    country: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    postcode: string;
  };
  dateOfBirth: string;
  preferredLanguage: string;
};

type UserResponse = {
  id: string;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.less'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'https://secret-earth-49998-b5c7e6fe39d1.herokuapp.com';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly languageOptions = ['EN', 'ES', 'FR', 'DE'];

  readonly registerForm = this.fb.group({
    firstName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    lastName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phoneCountryCode: this.fb.control('', [Validators.required, Validators.pattern(/^[+][0-9]{1,4}$/)]),
    phoneNumber: this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]),
    dateOfBirth: this.fb.control('', [Validators.required]),
    preferredLanguage: this.fb.control('EN', [Validators.required]),
    addressLine1: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    addressLine2: this.fb.control(''),
    city: this.fb.control('', [Validators.required]),
    country: this.fb.control('', [Validators.required]),
    postcode: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.control('', [Validators.required]),
    termsAccepted: this.fb.control(false, [Validators.requiredTrue])
  });

  get passwordsMismatch(): boolean {
    const { password, confirmPassword } = this.registerForm.controls;
    return (
      password.touched &&
      confirmPassword.touched &&
      password.value !== confirmPassword.value
    );
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid || this.passwordsMismatch) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.value;

    const createUserPayload: CreateUserRequest = {
      firstName: formValue.firstName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      phoneNumber: {
        countryCode: formValue.phoneCountryCode ?? '',
        number: formValue.phoneNumber ?? ''
      },
      address: {
        country: formValue.country ?? '',
        city: formValue.city ?? '',
        addressLine1: formValue.addressLine1 ?? '',
        addressLine2: formValue.addressLine2 ?? undefined,
        postcode: formValue.postcode ?? ''
      },
      dateOfBirth: formValue.dateOfBirth ?? '',
      preferredLanguage: formValue.preferredLanguage ?? 'EN'
    };

    this.isSubmitting = true;

    this.http
      .post<UserResponse>(`${this.apiBaseUrl}/api/v1/users`, createUserPayload)
      .pipe(
        switchMap((user) =>
          this.http.post(`${this.apiBaseUrl}/api/v1/users/${user.id}/password`, {
            password: formValue.password
          })
        ),
        tap(() => {
          this.successMessage = 'Account created successfully. Check your inbox for verification steps.';
          this.registerForm.reset({
            preferredLanguage: 'EN',
            termsAccepted: false
          });
        }),
        catchError((error) => {
          const message =
            error?.error?.message ??
            'We could not complete your registration right now. Please review your details and try again.';
          this.errorMessage = message;
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe();
  }
}
