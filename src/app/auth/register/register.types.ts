import { FormControl, FormGroup } from '@angular/forms';

export type RegisterFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneCountryCode: FormControl<string>;
  phoneNumber: FormControl<string>;
  dateOfBirth: FormControl<string>;
  termsAccepted: FormControl<boolean>;
};

export type RegisterFormGroup = FormGroup<RegisterFormControls>;

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: {
    countryCode: string;
    number: string;
  };
  dateOfBirth: string;
};

export type UserResponse = {
  id: string;
};
