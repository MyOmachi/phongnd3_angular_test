import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavouriteProductIdsState } from './favourite.reducer';

export const selectFavouriteProductIdsState =
  createFeatureSelector<FavouriteProductIdsState>('favouriteProductIds');

export const selectFavouriteProductIds = createSelector(
  selectFavouriteProductIdsState,
  (state) => state.favouriteProductIds
);
