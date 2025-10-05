import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, ReplaySubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../enviroments/environment';
import { Router } from '@angular/router';

const LOGIN_URL = `${environment.apiBaseUrl}/auth/login`;

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const excluded = req.url.startsWith(LOGIN_URL);
  const authed =
    !excluded && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.startsWith(LOGIN_URL)) {
        authService.clearAccessToken();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
