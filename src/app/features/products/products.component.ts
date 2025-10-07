import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ProductService } from '../../services/products.service';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { ProductsListComponent } from '../../shared/components/products-list/products-list.component';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../models/product.model';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll/infinite-scroll.directive';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductsListComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  private store = inject(Store);
  private productService = inject(ProductService);
  private readonly destroy$ = new Subject();

  favIds = signal<number[]>([]);
  private lastStoredFavIds: number[] = [];

  items = signal<Product[]>([]);
  loading = signal(false);
  done = signal(false);
  private pageSize = 12;

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

  loadMore() {
    if (this.loading() || this.done()) return;
    this.loading.set(true);
    const skip = this.items().length;
    this.productService.getProductsPage(this.pageSize, skip).subscribe({
      next: (batch) => {
        if (!batch || batch.length < this.pageSize) this.done.set(true);
        this.items.update((curr) => [...curr, ...(batch ?? [])]);
      },
      error: () => this.done.set(true),
      complete: () => this.loading.set(false),
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
