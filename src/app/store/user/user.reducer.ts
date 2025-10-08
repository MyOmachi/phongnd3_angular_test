import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { User } from '../../core/models/auth/auth.model';

export interface UserState {
  user: User | null;
}

export const initialUserState: UserState = {
  user: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loginSuccess, (state, { user }) => ({ ...state, user })),
  on(UserActions.loginFailure, () => initialUserState),
  on(UserActions.logout, () => initialUserState)
);
