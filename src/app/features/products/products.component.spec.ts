import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ProductsComponent } from './products.component';
import { ProductsListComponent } from '../shared/products-list/products-list.component';
import { ProductService } from '../../services/products.service';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { Product } from '../../models/product.model';

const sampleProducts: Product[] = [
  {
    id: 1,
    title: 'Phone',
    description: 'Nice',
    price: 100,
    thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp',
  },
  {
    id: 2,
    title: 'Laptop',
    description: 'Pro',
    price: 2000,
    thumbnail: 'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp',
  },
];

class ProductServiceStub {
  getAllProducts() {
    return of(sampleProducts);
  }
}

describe('ProductsComponent (integration)', () => {
  let store: MockStore;
  const initialState = {
    favouriteProductIds: { favouriteProductIds: [] as number[] },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent, ProductsListComponent],
      providers: [
        provideHttpClient(),
        provideMockStore({ initialState }),
        { provide: ProductService, useClass: ProductServiceStub },
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('renders products from ProductService via ProductsListComponent', async () => {
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();

    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);

    const el: HTMLElement = fixture.nativeElement;
    const titles = Array.from(el.querySelectorAll('span')).map((s) => s.textContent?.trim());

    expect(titles).toContain('Phone');
    expect(titles).toContain('Laptop');
  });

  it('toggles favourite in child and dispatches updateFavourite on destroy when changed', async () => {
    const fixture = TestBed.createComponent(ProductsComponent);

    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
    const [deferBlock] = await fixture.getDeferBlocks();
    await deferBlock.render(DeferBlockState.Complete);

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(button).withContext('Favourite button should exist').not.toBeNull();

    button!.click();
    fixture.detectChanges();
    fixture.destroy();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const actionArg = dispatchSpy.calls.mostRecent().args[0] as unknown as ReturnType<
      typeof updateFavourite
    >;
    expect(actionArg.type).toBe('[Favourite] Update');
    expect((actionArg as any).favouriteProductIds).toEqual([1]);
  });

  it('does NOT dispatch on destroy when favIds unchanged', () => {
    store.setState({ favouriteProductIds: { favouriteProductIds: [2] } });

    const fixture = TestBed.createComponent(ProductsComponent);
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
    fixture.destroy();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
