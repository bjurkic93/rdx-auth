import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RegisterAddressComponent } from './register-address.component';
import { RegisterFormGroup } from '../../register.types';

describe('RegisterAddressComponent', () => {
  let component: RegisterAddressComponent;
  let fixture: ComponentFixture<RegisterAddressComponent>;
  let form: RegisterFormGroup;

  beforeEach(async () => {
    const fb = new FormBuilder();
    form = fb.nonNullable.group({
      firstName: fb.nonNullable.control(''),
      lastName: fb.nonNullable.control(''),
      email: fb.nonNullable.control(''),
      phoneCountryCode: fb.nonNullable.control(''),
      phoneNumber: fb.nonNullable.control(''),
      dateOfBirth: fb.nonNullable.control(''),
      addressLine1: fb.nonNullable.control(''),
      addressLine2: fb.nonNullable.control(''),
      city: fb.nonNullable.control(''),
      country: fb.nonNullable.control(''),
      postcode: fb.nonNullable.control(''),
      password: fb.nonNullable.control(''),
      confirmPassword: fb.nonNullable.control(''),
      termsAccepted: fb.control(false, { nonNullable: true })
    });

    await TestBed.configureTestingModule({
      imports: [RegisterAddressComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterAddressComponent);
    component = fixture.componentInstance;
    component.form = form;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
