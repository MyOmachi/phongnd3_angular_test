import { Component, Directive } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ProductsComponent } from './products.component';
import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { selectFavouriteProducts } from '../../store/favourite/favourite.selectors';
import { updateFavouriteProducts } from '../../store/favourite/favourite.actions';

import { input, model, output } from '@angular/core';

@Component({
  selector: 'app-products-list',
  standalone: true,
  template: '',
})
class ProductsListStubComponent {
  products = input<Product[]>([]);
  favouriteIds = model<number[]>([]);
  viewed = output<number>();
}

/** Stub for the infinite scroll directive with function-based inputs/outputs. */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
class InfiniteScrollStubDirective {
  disabled = input<boolean>(false);
  reached = output<void>();

  /** Helper for the test to simulate reaching the sentinel. */
  trigger() {
    this.reached.emit();
  }
}

/* ---------- ProductService mock ---------- */

class ProductServiceMock {
  private database: Product[] = Array.from({ length: 35 }).map((_, i) => ({
    id: i + 1,
    title: `P${i + 1}`,
    price: 100 + i,
    description: `D${i + 1}`,
    thumbnail: '',
  }));

  getProductsPage(limit = 12, skip = 0) {
    const slice = this.database.slice(skip, skip + limit);
    return of(slice);
  }
}

describe('ProductsComponent (signals + infinite scroll)', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;
  let store: MockStore;

  const initialFavouriteFromStore: Product[] = [
    { id: 2, title: 'Init P2', price: 200, description: 'Init', thumbnail: '' },
    { id: 4, title: 'Init P4', price: 220, description: 'Init', thumbnail: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent], // bring in the real component
      providers: [
        { provide: ProductsService, useClass: ProductServiceMock },
        provideMockStore({
          initialState: {
            favouritesProducts: { favouriteProducts: initialFavouriteFromStore },
          },
        }),
      ],
    })
      // Replace real child imports with our stubs (so we can use InputSignal/OutputSignal)
      .overrideComponent(ProductsComponent, {
        remove: {
          // Remove the real imports that the standalone component declares
          imports: (ProductsComponent as any).ɵcmp.imports,
        },
        add: {
          // Add our stubs instead
          imports: [ProductsListStubComponent, InfiniteScrollStubDirective],
        },
      })
      .compileComponents();

    store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectFavouriteProducts, initialFavouriteFromStore);

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit -> loads first page (12)
  });

  it('loads the first page (12) on init and syncs favouriteIds from store', () => {
    expect(component.visibleProducts().length).toBe(12);
    expect(component['lastStoredFavouriteIds']).toEqual([2, 4]);
    expect(component.favouriteIds()).toEqual([2, 4]);
  });

  it('loadMore appends the next 12 (total 24), then the last page sets done (total 35)', () => {
    component.loadMore(); // page 2
    expect(component.visibleProducts().length).toBe(24);
    expect(component.done()).toBeFalse();

    component.loadMore(); // page 3 -> only 11 remain (35 total)
    expect(component.visibleProducts().length).toBe(35);
    expect(component.done()).toBeTrue();
  });

  it('emitting (reached) from the infinite scroll directive triggers loadMore()', () => {
    // First page is already loaded (12). Trigger sentinel to load next page.
    const dirEl = fixture.debugElement.query(By.directive(InfiniteScrollStubDirective));
    const sentinel = dirEl.injector.get(InfiniteScrollStubDirective);
    sentinel.trigger();

    fixture.detectChanges();
    expect(component.visibleProducts().length).toBe(24);
  });

  it('does not dispatch on destroy when favourites are unchanged', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    // Keep favourites the same as initial ([2, 4])
    component.favouriteIds.set([2, 4]);

    fixture.destroy();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
