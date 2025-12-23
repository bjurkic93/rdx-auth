import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly userIdKey = 'userId';

  storeUserId(userId: string): void {
    localStorage.setItem(this.userIdKey, userId);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  clearUserId(): void {
    localStorage.removeItem(this.userIdKey);
  }
}
