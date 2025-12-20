import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, switchMap } from 'rxjs';
import { CreateUserRequest, UserResponse } from './register.types';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'https://secret-earth-49998-b5c7e6fe39d1.herokuapp.com';

  readonly emptyResult = EMPTY;

  register(payload: CreateUserRequest, password: string) {
    return this.http
      .post<UserResponse>(`${this.apiBaseUrl}/api/v1/users`, payload)
      .pipe(
        switchMap((user) =>
          this.http.post(`${this.apiBaseUrl}/api/v1/users/${user.id}/password`, {
            password
          })
        )
      );
  }
}
