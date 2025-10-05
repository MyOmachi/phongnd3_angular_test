import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import * as UserActions from './user.actions';
import { User } from '../../models/auth/auth.model';
import { Router } from '@angular/router';

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
}
