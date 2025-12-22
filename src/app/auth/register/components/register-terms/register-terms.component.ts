import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-terms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-terms.component.html',
  styleUrl: './register-terms.component.less'
})
export class RegisterTermsComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
}
