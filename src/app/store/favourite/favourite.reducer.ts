import { createReducer, on } from '@ngrx/store';
import { updateFavourite } from './favourite.actions';

export type FavouriteProductIdsState = {
  favouriteProductIds: number[];
};

export const initialFavouriteProductIdsState: FavouriteProductIdsState = {
  favouriteProductIds: [],
};

export const favouriteProductIdsReducer = createReducer<FavouriteProductIdsState>(
  initialFavouriteProductIdsState,
  on(updateFavourite, (state, { favouriteProductIds }) => ({ ...state, favouriteProductIds }))
);
