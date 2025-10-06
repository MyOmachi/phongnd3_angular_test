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

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((response) => this.persistSession(response)));
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  clearAccessToken(): void {
    sessionStorage.removeItem('accessToken');
  }

  private persistSession(res: LoginResponse) {
    sessionStorage.setItem('accessToken', res.accessToken);
  }
}
