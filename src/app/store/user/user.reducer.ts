import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/auth/auth.model';
import * as UserActions from './user.actions';

export const initialUserState: User = {
  id: -1,
  username: '',
  email: '',
};
export interface UserState {
  user: User;
}

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loginSuccess, (state, { user }) => ({ ...state, ...user })),
  on(UserActions.loginFailure, () => initialUserState)
);
