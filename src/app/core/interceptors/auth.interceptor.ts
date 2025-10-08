// src/app/auth/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, finalize, switchMap, take, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);
  private router = inject(Router);
  private isRefreshing = false;
  private refresh$ = new ReplaySubject<string | null>(1);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

    const authedReq = isAuthUrl ? req : this.addAuth(req);

    return next.handle(authedReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401 || isAuthUrl) {
          return throwError(() => err);
        }
        return this.handle401(req, next);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refresh$.pipe(
        take(1),
        switchMap((token) => {
          if (!token) return throwError(() => new Error('Refresh failed'));
          return next.handle(this.addAuth(req, token));
        })
      );
    }

    const rt = this.auth.getRefreshToken?.() ?? null;
    console.log('Refresh token:', rt);
    if (!rt) {
      this.forceLogout();
      return throwError(() => new Error('No refresh token'));
    }

    this.isRefreshing = true;

    return this.auth.refresh(rt).pipe(
      tap((res) => {
        this.auth.setAccessToken(res.accessToken);
        if ('refreshToken' in res && res.refreshToken) {
          this.auth.setRefreshToken?.(res.refreshToken);
        }
        this.refresh$.next(res.accessToken);
      }),
      switchMap((res) => next.handle(this.addAuth(req, res.accessToken))),
      catchError((e) => {
        this.refresh$.next(null);
        this.forceLogout();
        return throwError(() => e);
      }),
      finalize(() => {
        this.isRefreshing = false;
        this.refresh$.complete();
        this.refresh$ = new ReplaySubject<string | null>(1);
      })
    );
  }

  private addAuth(req: HttpRequest<any>, token = this.auth.getAccessToken()): HttpRequest<any> {
    return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  }

  private forceLogout(): void {
    this.auth.clearAllTokens?.();
    this.router.navigate(['/login']);
  }
}
