import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { CreateUserRequest, UserResponse } from './register.types';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8085';

  readonly emptyResult = EMPTY;

  register(payload: CreateUserRequest) {
    return this.http.post<UserResponse>(`${this.apiBaseUrl}/api/v1/users`, payload);
  }
}
