import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.less'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);

  readonly registerForm = this.fb.group({
    fullName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
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
    if (this.registerForm.invalid || this.passwordsMismatch) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.info('Registration payload', this.registerForm.value);
  }
}
