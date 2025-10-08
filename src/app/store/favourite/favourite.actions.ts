import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

export const updateFavouriteProducts = createAction(
  '[Favourite] Update Products',
  props<{ products: Product[] }>()
);
