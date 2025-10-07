import { ComponentFixture, DeferBlockBehavior, TestBed, waitForAsync } from '@angular/core/testing';
import { ɵDeferBlockState as DeferState } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { FavouritesComponent } from './favourites.component';
import { Product } from '../../models/product.model';

import * as FavouriteSelectors from '../../store/favourite/favourite.selectors';
import * as FavouriteActions from '../../store/favourite/favourite.actions';

function P(id: number): Product {
  return {
    id,
    title: 'P' + id,
    description: 'D' + id,
    price: id * 10,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
  } as Product;
}

async function completeAllDefers(fixture: ComponentFixture<any>) {
  const blocks = await fixture.getDeferBlocks();
  for (const b of blocks) {
    await b.render(DeferState.Complete);
  }
  fixture.detectChanges();
  await fixture.whenStable();
}

describe(FavouritesComponent.name, () => {
  let fixture: ComponentFixture<FavouritesComponent>;
  let component: FavouritesComponent;
  let store: MockStore;

  const initialFavs: Product[] = [];

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouritesComponent],
      providers: [
        provideMockStore({
          initialState: {
            favouritesProducts: { favouriteProducts: initialFavs },
            user: { isLoggedIn: true, user: null, error: null },
          },
          selectors: [{ selector: FavouriteSelectors.selectFavouriteProducts, value: initialFavs }],
        }),
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    fixture = TestBed.createComponent(FavouritesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the first page of favourites on init', waitForAsync(async () => {
    const size = (component as any).pageSize ?? 12;
    const all = Array.from({ length: size * 2 }, (_, i) => P(i + 1));
    store.overrideSelector(FavouriteSelectors.selectFavouriteProducts, all);

    fixture.detectChanges();
    await completeAllDefers(fixture);

    expect(component.visibleProducts().length).toBe(size);
    expect(component.done()).toBeFalse();
    expect(component.favouriteIds()).toEqual(all.map((p) => p.id));
  }));

  it('loads more and sets done when all favourites are visible', waitForAsync(async () => {
    const size = (component as any).pageSize ?? 12;
    const all = Array.from({ length: size + Math.floor(size / 2) }, (_, i) => P(100 + i));
    store.overrideSelector(FavouriteSelectors.selectFavouriteProducts, all);

    fixture.detectChanges();
    await completeAllDefers(fixture);

    expect(component.visibleProducts().length).toBe(size);
    expect(component.done()).toBeFalse();

    component.loadMore();
    await completeAllDefers(fixture);

    expect(component.visibleProducts().length).toBe(all.length);
    expect(component.done()).toBeTrue();
  }));

  it('dispatches updated favourites on destroy when favouriteIds changed', waitForAsync(async () => {
    (store as any).dispatch = jasmine.createSpy('dispatch');

    const size = (component as any).pageSize ?? 12;
    const all = Array.from({ length: size }, (_, i) => P(200 + i));
    store.overrideSelector(FavouriteSelectors.selectFavouriteProducts, all);

    fixture.detectChanges();
    await completeAllDefers(fixture);

    const ids = all.map((p) => p.id);
    ids.pop();
    component.favouriteIds.set(ids);

    fixture.destroy();

    const expected = all.slice(0, all.length - 1);
    expect(store.dispatch as any).toHaveBeenCalledWith(
      FavouriteActions.updateFavouriteProducts({ products: expected })
    );
  }));
});
