import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterFormGroup } from '../../register.types';

@Component({
  selector: 'app-register-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-address.component.html',
  styleUrl: './register-address.component.less'
})
export class RegisterAddressComponent {
  @Input({ required: true }) form!: RegisterFormGroup;
}
