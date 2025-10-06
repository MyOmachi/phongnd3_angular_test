import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectCurrentUser = createSelector(selectUserState, (state: UserState) => state.user);

export const selectIsLoggedIn = createSelector(selectCurrentUser, (user) => !!user);
