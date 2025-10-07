import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { login, loginFailure, loginSuccess } from './user.actions';
import { userReducer, initialUserState, UserState } from './user.reducer';
import * as UserSelectors from './user.selectors';
import { UserEffects } from './user.effects';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth/auth.model';

function U(id: number): User {
  return { id, username: 'user' + id, email: 'u' + id + '@mail.com' } as User;
}

describe('User Store', () => {
  describe('Actions', () => {
    it('login creates action with credentials', () => {
      const action = login({ username: 'alice', password: 'pw' });
      expect(action.type).toBe('[User] Login');
      expect(action.username).toBe('alice');
      expect(action.password).toBe('pw');
    });

    it('loginSuccess creates action with user', () => {
      const user = U(1);
      const action = loginSuccess({ user });
      expect(action.type).toBe('[User] Login Success');
      expect(action.user).toEqual(user);
    });

    it('loginFailure creates action with error', () => {
      const err = { message: 'x' };
      const action = loginFailure({ error: err } as any);
      expect(action.type).toBe('[User] Login Failure');
      expect((action as any).error).toBe(err);
    });
  });

  describe('Reducer', () => {
    it('returns initial state for unknown action', () => {
      const state = userReducer(undefined as any, { type: '@@init' } as any);
      expect(state).toEqual(initialUserState);
    });

    it('sets user on loginSuccess', () => {
      const prev: UserState = { user: null };
      const user = U(2);
      const state = userReducer(prev, loginSuccess({ user }));
      expect(state.user).toEqual(user);
    });

    it('resets to initial on loginFailure', () => {
      const prev: UserState = { user: U(9) };
      const state = userReducer(prev, loginFailure({ error: 'bad' } as any));
      expect(state).toEqual(initialUserState);
    });
  });

  describe('Selectors', () => {
    it('selectUserState projector returns slice', () => {
      const slice: UserState = { user: U(5) };
      const result = UserSelectors.selectUserState.projector(slice);
      expect(result).toBe(slice);
    });

    it('selectCurrentUser projector returns user', () => {
      const slice: UserState = { user: U(6) };
      const result = UserSelectors.selectCurrentUser.projector(slice);
      expect(result).toEqual(slice.user);
    });

    it('selectIsLoggedIn true when user exists', () => {
      expect(UserSelectors.selectIsLoggedIn.projector(U(1))).toBeTrue();
      expect(UserSelectors.selectIsLoggedIn.projector(null as any)).toBeFalse();
    });
  });

  describe('Effects', () => {
    let actions$: Subject<any>;
    let effects: UserEffects;
    let authSvc: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
      actions$ = new Subject<any>();
      authSvc = jasmine.createSpyObj<AuthService>('AuthService', [
        'login',
        'setAccessToken',
        'clearAccessToken',
        'getAccessToken',
      ]);
      router = jasmine.createSpyObj<Router>('Router', ['navigate']);

      TestBed.configureTestingModule({
        providers: [
          UserEffects,
          provideMockActions(() => actions$ as unknown as Observable<any>),
          { provide: AuthService, useValue: authSvc },
          { provide: Router, useValue: router },
        ],
      });

      effects = TestBed.inject(UserEffects);
    });

    it('login$ emits loginSuccess on success', (done) => {
      const user = U(42);
      authSvc.login.and.returnValue(
        of({
          id: user.id,
          username: user.username,
          email: user.email,
          accessToken: 'a',
          refreshToken: 'r',
        } as any)
      );

      const sub = effects.login$.subscribe({
        next: (action) => {
          expect(action).toEqual(loginSuccess({ user }));
          sub.unsubscribe();
          done();
        },
        error: done.fail,
      });

      actions$.next(login({ username: 'bob', password: 'pw' }));
    });

    it('login$ emits loginFailure on error', (done) => {
      const err = new Error('bad creds');
      authSvc.login.and.returnValue(throwError(() => err));

      const sub = effects.login$.subscribe({
        next: (action) => {
          expect(action.type).toBe('[User] Login Failure');
          expect((action as any).error).toBeTruthy();
          sub.unsubscribe();
          done();
        },
        error: done.fail,
      });

      actions$.next(login({ username: 'eve', password: 'nope' }));
    });

    it('loginSuccess$ navigates to /products and does not dispatch', (done) => {
      let emitted = false;
      const sub = effects.loginSuccess$.subscribe({
        next: () => {
          emitted = true;
        },
        complete: () => {},
      });

      actions$.next(loginSuccess({ user: U(1) }));

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/products']);
        expect(emitted).toBeFalse(); // dispatch: false
        sub.unsubscribe();
        done();
      }, 0);
    });
  });
});
