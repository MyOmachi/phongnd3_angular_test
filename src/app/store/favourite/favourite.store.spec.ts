import { updateFavourite } from './favourite.actions';
import { favouriteProductIdsReducer, initialFavouriteProductIdsState } from './favourite.reducer';
import { selectFavouriteProductIds, selectFavouriteProductIdsState } from './favourite.selectors';

describe('Favourite store (actions / reducer / selectors)', () => {
  it('should create the updateFavourite action with payload', () => {
    const payload = { favouriteProductIds: [1, 2, 3] };
    const action = updateFavourite(payload);

    expect(action.type).toBe('[Favourite] Update');
    expect(action.favouriteProductIds).toEqual(payload.favouriteProductIds);
  });

  it('should update state when updateFavourite is dispatched', () => {
    const payload = { favouriteProductIds: [5, 7, 11] };
    const action = updateFavourite(payload);

    const newState = favouriteProductIdsReducer(initialFavouriteProductIdsState, action as any);

    expect(newState.favouriteProductIds).toEqual(payload.favouriteProductIds);
  });

  it('selector selectFavouriteProductIds should return the favourite ids array', () => {
    const fakeState = {
      favouriteProductIds: {
        favouriteProductIds: [42, 43],
      },
    } as any;

    const selected = selectFavouriteProductIds(fakeState);
    expect(selected).toEqual([42, 43]);
  });

  it('selectFavouriteProductIdsState should select the feature slice', () => {
    const fakeRootState = {
      favouriteProductIds: {
        favouriteProductIds: [99],
      },
    } as any;

    const slice = selectFavouriteProductIdsState(fakeRootState);
    expect(slice).toEqual({ favouriteProductIds: [99] });
  });
});
