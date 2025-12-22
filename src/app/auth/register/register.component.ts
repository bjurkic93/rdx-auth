import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, switchMap, tap } from 'rxjs';
import { RegisterService } from './register.service';
import { RegisterAddressComponent } from './components/register-address/register-address.component';
import { RegisterContactPreferencesComponent } from './components/register-contact-preferences/register-contact-preferences.component';
import { RegisterPersonalInfoComponent } from './components/register-personal-info/register-personal-info.component';
import { RegisterTermsComponent } from './components/register-terms/register-terms.component';
import { CreateUserRequest, RegisterFormGroup } from './register.types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegisterPersonalInfoComponent,
    RegisterContactPreferencesComponent,
    RegisterAddressComponent,
    RegisterTermsComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.less'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  duplicateExistsOpen = false;
  duplicateExistsMessage = 'This contact already exists. Please use a different one.';

  readonly registerForm: RegisterFormGroup = this.fb.nonNullable.group({
    firstName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    lastName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    phoneCountryCode: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[+][0-9]{1,4}$/)]),
    phoneNumber: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]),
    dateOfBirth: this.fb.nonNullable.control('', [Validators.required]),
    addressLine1: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    addressLine2: this.fb.nonNullable.control(''),
    city: this.fb.nonNullable.control('', [Validators.required]),
    country: this.fb.nonNullable.control('', [Validators.required]),
    postcode: this.fb.nonNullable.control('', [Validators.required]),
    termsAccepted: this.fb.control(false, { validators: [Validators.requiredTrue], nonNullable: true })
  });

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.duplicateExistsOpen = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    const createUserPayload: CreateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: {
        countryCode: formValue.phoneCountryCode,
        number: formValue.phoneNumber
      },
      address: {
        country: formValue.country,
        city: formValue.city,
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2 || undefined,
        postcode: formValue.postcode
      },
      dateOfBirth: formValue.dateOfBirth
    };

    this.isSubmitting = true;

    this.registerService
      .register(createUserPayload)
      .pipe(
        switchMap((user) => this.registerService.sendEmailValidation(user.id)),
        tap(() => {
          this.successMessage = 'Account created. Check your email to validate your address.';
          this.registerForm.reset({
            termsAccepted: false
          });
        }),
        catchError((error) => {
          const errorCode = error?.error?.errorCode;
          if (errorCode === 'PHONE_ALREADY_EXISTS' || errorCode === 'EMAIL_ALREADY_EXISTS') {
            this.duplicateExistsOpen = true;
            this.duplicateExistsMessage = error?.error?.errorMessage ?? this.duplicateExistsMessage;
            return this.registerService.emptyResult;
          }

          const message =
            error?.error?.message ??
            'We could not complete your registration right now. Please review your details and try again.';
          this.errorMessage = message;
          return this.registerService.emptyResult;
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe();
  }
}
