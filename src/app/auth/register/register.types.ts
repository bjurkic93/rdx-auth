import { FormControl, FormGroup } from '@angular/forms';

export type RegisterFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneCountryCode: FormControl<string>;
  phoneNumber: FormControl<string>;
  dateOfBirth: FormControl<string>;
  addressLine1: FormControl<string>;
  addressLine2: FormControl<string>;
  city: FormControl<string>;
  country: FormControl<string>;
  postcode: FormControl<string>;
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
  address: {
    country: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    postcode: string;
  };
  dateOfBirth: string;
};

export type UserResponse = {
  id: string;
};
