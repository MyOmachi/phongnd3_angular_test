import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import * as UserActions from './user.actions';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth/auth.model';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      exhaustMap(({ username, password }) =>
        this.authService.login(username, password).pipe(
          tap((res) => {
            this.authService.setAccessToken(res.accessToken);
            this.authService.setRefreshToken(res.refreshToken);
          }),
          map((user: User) => {
            const { id, username, email } = user;
            return UserActions.loginSuccess({ user: { id, username, email } });
          }),
          catchError((error) => of(UserActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.loginSuccess),
        switchMap(() => {
          this.router.navigate(['/products']);
          return of();
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.loginFailure),
        tap(() => this.authService.clearAllTokens())
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.logout),
        tap(() => {
          this.authService.clearAllTokens();
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}
