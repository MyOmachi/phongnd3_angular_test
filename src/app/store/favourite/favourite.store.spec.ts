import { updateFavouriteProducts } from './favourite.actions';
import {
  favouriteProductsReducer,
  initialFavouriteProducts,
  FavouriteProducts,
} from './favourite.reducer';
import * as FavouriteSelectors from './favourite.selectors';
import { Product } from '../../models/product.model';

function P(id: number): Product {
  return {
    id,
    title: 'P' + id,
    description: 'D' + id,
    price: id * 10,
    thumbnail: 't' + id + '.jpg',
  } as Product;
}

describe('Favourite Store', () => {
  describe('Actions', () => {
    it('updateFavouriteProducts should create action with products payload', () => {
      const products = [P(1), P(2)];
      const action = updateFavouriteProducts({ products });
      expect(action.type).toBe('[Favourite] Update Products');
      expect(action.products).toEqual(products);
    });
  });

  describe('Reducer', () => {
    it('should return the initial state when passed an unknown action', () => {
      const state = favouriteProductsReducer(undefined as any, { type: '@@init' } as any);
      expect(state).toEqual(initialFavouriteProducts);
    });

    it('should update favouriteProducts on updateFavouriteProducts', () => {
      const prev: FavouriteProducts = { favouriteProducts: [P(9)] };
      Object.freeze(prev);
      const products = [P(1), P(2), P(3)];

      const state = favouriteProductsReducer(prev, updateFavouriteProducts({ products }));

      expect(state).not.toBe(prev);
      expect(state.favouriteProducts).toEqual(products);
    });

    it('should allow clearing favourites via updateFavouriteProducts([])', () => {
      const prev: FavouriteProducts = { favouriteProducts: [P(1), P(2)] };
      const state = favouriteProductsReducer(prev, updateFavouriteProducts({ products: [] }));
      expect(state.favouriteProducts).toEqual([]);
    });
  });

  describe('Selectors', () => {
    it('selectFavouritesProductsFeature should return the feature slice', () => {
      const feature: FavouriteProducts = { favouriteProducts: [P(1)] };
      const result = FavouriteSelectors.selectFavouritesProductsFeature.projector(feature);
      expect(result).toBe(feature);
    });

    it('selectFavouriteProducts should read favouriteProducts array', () => {
      const feature: FavouriteProducts = { favouriteProducts: [P(1), P(2)] };
      const result = FavouriteSelectors.selectFavouriteProducts.projector(feature);
      expect(result).toEqual(feature.favouriteProducts);
    });

    it('selectFavouriteIds should map products to id list', () => {
      const products = [P(5), P(6), P(7)];
      const ids = FavouriteSelectors.selectFavouriteIds.projector(products);
      expect(ids).toEqual([5, 6, 7]);
    });
  });
});
