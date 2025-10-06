import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ProductService } from '../../services/products.service';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { ProductsListComponent } from '../shared/products-list/products-list.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, MatButtonModule, MatIconModule, AsyncPipe, ProductsListComponent],
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  private store = inject(Store);
  private productService = inject(ProductService);
  private readonly destroy$ = new Subject();

  favIds = signal<number[]>([]);
  private lastStoredFavIds: number[] = [];

  products$ = this.productService.getAllProducts();

  ngOnInit() {
    this.store
      .select(selectFavouriteProductIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe((ids) => {
        this.lastStoredFavIds = [...ids];
        this.favIds.set([...ids]);
      });
  }

  ngOnDestroy() {
    const currentIds = this.favIds();
    const storedIds = this.lastStoredFavIds || [];
    const isEqual =
      currentIds.length === storedIds.length && currentIds.every((v, i) => v === storedIds[i]);
    if (!isEqual) {
      this.store.dispatch(updateFavourite({ favouriteProductIds: currentIds }));
    }

    this.destroy$.next(0);
    this.destroy$.complete();
  }
}
