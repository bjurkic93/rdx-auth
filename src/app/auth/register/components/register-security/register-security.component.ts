import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-security.component.html',
  styleUrl: './register-security.component.less'
})
export class RegisterSecurityComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
  @Input({ required: true }) passwordsMismatch!: boolean;
}
