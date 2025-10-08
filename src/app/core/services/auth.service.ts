import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, User } from '../models/auth/auth.model';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private baseUrl = `${environment.apiBaseUrl}/auth`;

  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      username,
      password,
      expiresInMins: 1,
    });
  }

  refresh(refreshToken: string) {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.baseUrl}/refresh`,
      { refreshToken }
    );
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string | null): void {
    if (token) sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    else sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    this.setAccessToken(null);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string | null): void {
    if (token) sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  clearRefreshToken(): void {
    this.setRefreshToken(null);
  }

  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }

  me() {
    return this.http.get<User>(`${environment.apiBaseUrl}/auth/me`);
  }
}
