import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';

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
    path: 'verify-email',
    component: EmailVerificationComponent
  }
];
