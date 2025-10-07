import { createAction, props } from '@ngrx/store';

import { User } from '../../models/auth/auth.model';

export const login = createAction('[User] Login', props<{ username: string; password: string }>());

export const loginSuccess = createAction('[User] Login Success', props<{ user: User }>());

export const loginFailure = createAction('[User] Login Failure', props<{ error: any }>());

export const logout = createAction('[User] Logout');
