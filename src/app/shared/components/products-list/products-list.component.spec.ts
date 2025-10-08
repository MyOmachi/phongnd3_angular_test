import { ComponentFixture, DeferBlockBehavior, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ɵDeferBlockState as DeferState } from '@angular/core';

import { ProductsListComponent } from './products-list.component';
import { Product } from '../../../models/product.model';

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

describe(ProductsListComponent.name, () => {
  let fixture: ComponentFixture<ProductsListComponent>;
  let component: ProductsListComponent;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListComponent],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a card per product', waitForAsync(async () => {
    fixture.componentRef.setInput('products', [P(1), P(2), P(3)]);
    fixture.componentRef.setInput('favouriteIds', [2]);
    fixture.detectChanges();
    await completeAllDefers(fixture);

    const items = fixture.debugElement.queryAll(By.css('article[role="listitem"]'));
    expect(items.length).toBe(3);

    const favBtns = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
    expect(favBtns.length).toBe(3);
    // second is favourited initially
    expect(favBtns[1].attributes['aria-pressed']).toBe('true');
    expect(favBtns[0].attributes['aria-pressed']).toBe('false');
    expect(favBtns[2].attributes['aria-pressed']).toBe('false');
  }));

  it('toggles favouriteIds when clicking the favourite button', waitForAsync(async () => {
    fixture.componentRef.setInput('products', [P(1), P(2)]);
    fixture.componentRef.setInput('favouriteIds', [2]);
    fixture.detectChanges();
    await completeAllDefers(fixture);

    let favBtns = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
    favBtns[0].nativeElement.click();
    fixture.detectChanges();
    await completeAllDefers(fixture);

    expect(component.favouriteIds().sort((a, b) => a - b)).toEqual([1, 2]);

    favBtns = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
    expect(favBtns[0].attributes['aria-pressed']).toBe('true');

    // Toggle again -> remove 1
    favBtns[0].nativeElement.click();
    fixture.detectChanges();
    await completeAllDefers(fixture);

    expect(component.favouriteIds()).toEqual([2]);
    favBtns = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
    expect(favBtns[0].attributes['aria-pressed']).toBe('false');
  }));
});
