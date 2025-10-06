import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/auth/auth.model';
import * as UserActions from './user.actions';

export interface UserState {
  user: User | null;
}

export const initialUserState: UserState = {
  user: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loginSuccess, (state, { user }) => ({ ...state, user })),
  on(UserActions.loginFailure, () => initialUserState)
);
