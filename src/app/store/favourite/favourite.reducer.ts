import { createReducer, on } from '@ngrx/store';
import { updateFavouriteProducts } from './favourite.actions';
import * as UserActions from '../user/user.actions';
import { Product } from '../../core/models/product.model';

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
  })),
  on(UserActions.logout, () => initialFavouriteProducts)
);
