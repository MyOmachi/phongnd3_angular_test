import { updateFavouriteProducts } from './favourite.actions';
import {
  favouriteProductsReducer,
  initialFavouriteProducts,
  FavouriteProducts,
} from './favourite.reducer';
import {
  selectFavouritesProductsFeature,
  selectFavouriteProducts,
  selectFavouriteIds,
} from './favourite.selectors';
import { Product } from '../../models/product.model';

describe('FavouriteProducts store (actions / reducer / selectors)', () => {
  const mockProducts: Product[] = [
    { id: 1, title: 'Laptop', price: 1200, description: 'Powerful laptop', thumbnail: '' },
    {
      id: 2,
      title: 'Phone',
      price: 800,
      description: 'Smartphone with OLED screen',
      thumbnail: '',
    },
  ];

  it('should create the updateFavouriteProducts action with payload', () => {
    const action = updateFavouriteProducts({ products: mockProducts });
    expect(action.type).toBe('[Favourite] Update Products');
    expect(action.products).toEqual(mockProducts);
  });

  it('should update state when updateFavouriteProducts is dispatched', () => {
    const action = updateFavouriteProducts({ products: mockProducts });
    const newState = favouriteProductsReducer(initialFavouriteProducts, action);

    expect(newState.favouriteProducts.length).toBe(2);
    expect(newState.favouriteProducts[0].title).toBe('Laptop');
  });

  it('selectFavouritesProductsFeature should return the full feature slice', () => {
    const fakeState = {
      favouritesProducts: {
        favouriteProducts: mockProducts,
      },
    } as { favouritesProducts: FavouriteProducts };

    const feature = selectFavouritesProductsFeature(fakeState);
    expect(feature.favouriteProducts.length).toBe(2);
  });

  it('selectFavouriteProducts should return the products array', () => {
    const fakeState = {
      favouritesProducts: {
        favouriteProducts: mockProducts,
      },
    } as { favouritesProducts: FavouriteProducts };

    const selected = selectFavouriteProducts(fakeState);
    expect(selected).toEqual(mockProducts);
  });

  it('selectFavouriteIds should return only the ids from products', () => {
    const fakeState = {
      favouritesProducts: {
        favouriteProducts: mockProducts,
      },
    } as { favouritesProducts: FavouriteProducts };

    const ids = selectFavouriteIds(fakeState);
    expect(ids).toEqual([1, 2]);
  });
});
