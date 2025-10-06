import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { FavouritesComponent } from './favourites.component';
import { ProductService } from '../../services/products.service';

describe('FavouritesComponent', () => {
  let component: FavouritesComponent;
  let fixture: ComponentFixture<FavouritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouritesComponent],
      providers: [
        provideMockStore({
          initialState: { user: {}, favouriteProductIds: { favouriteProductIds: [] } },
        }),
        { provide: ProductService, useValue: { getAllProducts: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
