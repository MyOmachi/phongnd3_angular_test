import { createAction, props } from '@ngrx/store';

export const updateFavourite = createAction(
  '[Favourite] Update',
  props<{ favouriteProductIds: number[] }>()
);
