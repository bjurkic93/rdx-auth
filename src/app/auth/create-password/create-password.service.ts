import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CreatePasswordRequest = {
  email: string;
  password: string;
};

export type CreatePasswordResponse = {
  token: string;
};

@Injectable({ providedIn: 'root' })
export class CreatePasswordService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  createPassword(payload: CreatePasswordRequest, userId: string): Observable<CreatePasswordResponse> {
    return this.http.post<CreatePasswordResponse>(`${this.apiBaseUrl}/api/v1/users/${userId}/password`, payload);
  }
}
