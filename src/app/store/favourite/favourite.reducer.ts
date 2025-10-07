import { createReducer, on } from '@ngrx/store';
import { Product } from '../../models/product.model';
import { updateFavouriteProducts } from './favourite.actions';

export interface FavouriteProducts {
  favouriteProducts: Product[];
}

export const initialFavouriteProducts: FavouriteProducts = {
  favouriteProducts: [],
};

export const favouriteProductsReducer = createReducer(
  initialFavouriteProducts,
  on(updateFavouriteProducts, (state, { products }) => ({
    ...state,
    favouriteProducts: products ?? [],
  }))
);
