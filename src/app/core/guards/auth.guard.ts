import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth.service';
import { selectUserState } from '../../store/user/user.selectors';
import { loginSuccess } from '../../store/user/user.actions';
import { catchError, map, of, switchMap, take, tap } from 'rxjs';

export const authGuard: CanActivateFn = (): any => {
  const authService = inject(AuthService);
  const store = inject(Store);
  const router = inject(Router);

  const hasToken = !!authService.getAccessToken();

  if (!hasToken) {
    const toLogin: UrlTree = router.parseUrl('/login');
    return toLogin;
  }

  return store.select(selectUserState).pipe(
    take(1),
    switchMap((user) => {
      if (user.user) return of(true);
      return authService.me().pipe(
        tap((u) =>
          store.dispatch(loginSuccess({ user: { id: u.id, username: u.username, email: u.email } }))
        ),
        map(() => true),
        catchError(() => of(router.parseUrl('/login')))
      );
    })
  );
};
