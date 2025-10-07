import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavouriteProducts } from './favourite.reducer';

export const selectFavouritesProductsFeature =
  createFeatureSelector<FavouriteProducts>('favouritesProducts');

export const selectFavouriteProducts = createSelector(
  selectFavouritesProductsFeature,
  (s) => s.favouriteProducts
);

export const selectFavouriteIds = createSelector(selectFavouriteProducts, (products) =>
  products.map((p) => p.id)
);
