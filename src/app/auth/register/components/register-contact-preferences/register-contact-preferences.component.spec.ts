import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RegisterContactPreferencesComponent } from './register-contact-preferences.component';
import { RegisterFormGroup } from '../../register.types';

describe('RegisterContactPreferencesComponent', () => {
  let component: RegisterContactPreferencesComponent;
  let fixture: ComponentFixture<RegisterContactPreferencesComponent>;
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
      imports: [RegisterContactPreferencesComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterContactPreferencesComponent);
    component = fixture.componentInstance;
    component.form = form;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
