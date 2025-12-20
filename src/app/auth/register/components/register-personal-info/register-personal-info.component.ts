import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-personal-info',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-personal-info.component.html',
  styleUrl: './register-personal-info.component.less'
})
export class RegisterPersonalInfoComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
}
