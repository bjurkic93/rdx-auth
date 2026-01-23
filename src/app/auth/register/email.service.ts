import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  sendVerificationCode(email: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/email/send`, { email });
  }

  verifyEmailCode(email: string, verificationCode: string): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/api/v1/users/verification/email/verify`, {
      email,
      verificationCode
    });
  }
}
