import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhoneVerificationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  sendVerificationCode(phoneCountryCode: string, phoneNumber: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/phone/send`, {
      phoneNumber: {
        countryCode: phoneCountryCode,
        number: phoneNumber
      }
    });
  }

  verifyPhoneCode(phoneCountryCode: string, phoneNumber: string, verificationCode: string) {
    return this.http.post(`${this.apiBaseUrl}/api/v1/users/verification/phone/verify`, {
      phoneNumber: {
        countryCode: phoneCountryCode,
        number: phoneNumber
      },
      verificationCode
    });
  }
}
