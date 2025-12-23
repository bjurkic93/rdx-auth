import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EmailVerificationResponse = {
  token: string;
};

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8085';

  sendVerificationCode(email: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/email/send`, { email });
  }

  verifyEmailCode(email: string, verificationCode: string): Observable<EmailVerificationResponse> {
    return this.http.post<EmailVerificationResponse>(`${this.apiBaseUrl}/api/v1/users/verification/email/verify`, {
      email,
      verificationCode
    });
  }
}
