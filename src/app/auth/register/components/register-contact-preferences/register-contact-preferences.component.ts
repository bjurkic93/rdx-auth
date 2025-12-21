import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageOption, RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-contact-preferences',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-contact-preferences.component.html',
  styleUrl: './register-contact-preferences.component.less'
})
export class RegisterContactPreferencesComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
  @Input() languageOptions: LanguageOption[] = [];
}
