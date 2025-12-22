import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8085';

  sendVerificationCode(email: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/sendEmailVerificationCode`, { email });
  }
}
