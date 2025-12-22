import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-contact-preferences',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-contact-preferences.component.html',
  styleUrl: './register-contact-preferences.component.less'
})
export class RegisterContactPreferencesComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
}
