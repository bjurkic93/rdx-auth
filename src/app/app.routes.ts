import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';
import { PhoneVerificationComponent } from './auth/phone-verification/phone-verification.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'verify-email',
    component: EmailVerificationComponent
  },
  {
    path: 'verify-phone',
    component: PhoneVerificationComponent
  }
];
