import { ComponentFixture, DeferBlockBehavior, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ɵDeferBlockState as DeferState } from '@angular/core';
import { of, Subject } from 'rxjs';

import { ProductsComponent } from './products.component';

import * as FavouriteSelectors from '../../store/favourite/favourite.selectors';
import * as FavouriteActions from '../../store/favourite/favourite.actions';
import { Product } from '../../core/models/product.model';
import { ProductsService } from '../../core/services/products.service';

class ProductsServiceMock {
  getProductsPage = jasmine.createSpy('getProductsPage');
}

function P(id: number): Product {
  return {
    id,
    title: 'Product ' + id,
    description: 'Description ' + id,
    price: id * 10,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
  } as Product;
}

function makePage(startId: number, count: number): Product[] {
  return Array.from({ length: count }, (_, i) => P(startId + i));
}

/** Render all defer blocks to Complete state (covers @defer inside child components) */
async function completeAllDefers(fixture: ComponentFixture<any>) {
  const blocks = await fixture.getDeferBlocks();
  for (const b of blocks) {
    await b.render(DeferState.Complete);
  }
  fixture.detectChanges();
  await fixture.whenStable();
}

describe(ProductsComponent.name, () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;
  let productService: ProductsServiceMock;
  let store: MockStore;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        { provide: ProductsService, useClass: ProductsServiceMock },
        provideMockStore({
          initialState: {
            favouritesProducts: { favouriteProducts: [] },
            user: { isLoggedIn: true, user: null, error: null },
          },
          selectors: [{ selector: FavouriteSelectors.selectFavouriteProducts, value: [] }],
        }),
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductsService) as unknown as ProductsServiceMock;
    store = TestBed.inject(MockStore);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the first page on init', waitForAsync(async () => {
    const size = (component as any).pageSize ?? 12;
    const firstPage = makePage(1, size);
    productService.getProductsPage.and.returnValue(of(firstPage));

    fixture.detectChanges();
    await completeAllDefers(fixture);

    expect(productService.getProductsPage).toHaveBeenCalledTimes(1);
    const [limit, skip] = productService.getProductsPage.calls.mostRecent().args as [
      number,
      number
    ];
    expect(typeof limit).toBe('number');
    expect(skip).toBe(0);

    expect(component.visibleProducts()).toEqual(firstPage);
    expect(component.loading()).toBeFalse();
    expect(component.done()).toBeFalse();
  }));

  it('loads more via loadMore() with skip = currentLength', waitForAsync(async () => {
    const size = (component as any).pageSize ?? 12;
    const firstPage = makePage(1, size);
    const secondPage = makePage(100, Math.max(1, Math.floor(size / 3)));
    productService.getProductsPage.and.returnValues(of(firstPage), of(secondPage));

    fixture.detectChanges();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(1);

    component.loadMore();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(2);

    const all = productService.getProductsPage.calls.allArgs();
    const secondArgs = all[1] as [number, number];
    const [limit2, skip2] = secondArgs;
    expect(typeof limit2).toBe('number');
    expect(skip2).toBe(firstPage.length);

    expect(component.visibleProducts()).toEqual([...firstPage, ...secondPage]);
    expect(component.done()).toBeTrue();
  }));

  it('sets done=true when an empty page is returned and prevents further loads', waitForAsync(async () => {
    productService.getProductsPage.and.returnValue(of([]));

    fixture.detectChanges();
    await completeAllDefers(fixture);
    expect(component.done()).toBeTrue();

    component.loadMore();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(1);
  }));

  it('does not trigger another load while loading=true (back-pressure)', waitForAsync(async () => {
    const size = (component as any).pageSize ?? 12;
    const firstReq = new Subject<Product[]>();
    let callIndex = 0;
    const secondPage = makePage(100, size);
    productService.getProductsPage.and.callFake((_limit: number, _skip: number) => {
      callIndex++;
      return callIndex === 1 ? firstReq.asObservable() : of(secondPage);
    });

    fixture.detectChanges();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(1);
    expect(component.loading()).toBeTrue();

    component.loadMore();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(1);

    firstReq.next(makePage(1, size));
    firstReq.complete();
    await completeAllDefers(fixture);
    expect(component.loading()).toBeFalse();
    expect(component.done()).toBeFalse();

    component.loadMore();
    await completeAllDefers(fixture);
    expect(productService.getProductsPage.calls.count()).toBe(2);
  }));

  it('dispatches favourites to store on destroy when ids changed', waitForAsync(async () => {
    (store as any).dispatch = jasmine.createSpy('dispatch');

    const size = (component as any).pageSize ?? 12;
    const page = makePage(1, size);
    productService.getProductsPage.and.returnValue(of(page));

    fixture.detectChanges();
    await completeAllDefers(fixture);

    component.favouriteIds.set([page[0].id, page[size - 1].id]);

    fixture.destroy();

    expect(store.dispatch as any).toHaveBeenCalledWith(
      FavouriteActions.updateFavouriteProducts({ products: [page[0], page[size - 1]] })
    );
  }));
});
