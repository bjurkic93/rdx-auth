import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8085';

  createPassword(email: string, verificationCode: string, password: string) {
    return this.http.post<CreatePasswordResponse>(`${this.apiBaseUrl}/api/v1/users/password`, {
      email,
      verificationCode,
      password
    });
  }

  sendVerificationCode(email: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/email/send`, { email });
  }

  verifyEmailCode(email: string, verificationCode: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/email/verify`, { email, verificationCode });
  }
}

export type CreatePasswordResponse = {
  token: string;
};
