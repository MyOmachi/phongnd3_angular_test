import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { LoginResponse } from '../models/auth/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly STORAGE_KEY = 'accessToken';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((response) => this.setAccessToken(response.accessToken)));
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  setAccessToken(token: string | null): void {
    if (token) sessionStorage.setItem(this.STORAGE_KEY, token);
    else sessionStorage.removeItem(this.STORAGE_KEY);
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
