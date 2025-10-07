import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { selectFavouriteProducts } from '../../store/favourite/favourite.selectors';
import { updateFavouriteProducts } from '../../store/favourite/favourite.actions';
import { ProductsListComponent } from '../../shared/components/products-list/products-list.component';
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
export class ProductsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private productsService = inject(ProductsService);

  visibleProducts = signal<Product[]>([]);
  loading = signal(false);
  done = signal(false);
  favouriteIds = signal<number[]>([]);
  private lastStoredFavouriteIds: number[] = [];

  private pageSize = 12;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Sync favourites từ store -> favouriteIds (để 2-way binding với ProductsList)
    this.store
      .select(selectFavouriteProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        const ids = (list ?? []).map((p) => p.id);
        this.lastStoredFavouriteIds = ids;
        this.favouriteIds.set(ids);
      });

    // Tải trang đầu
    this.loadMore();
  }

  loadMore() {
    // Back-pressure + idempotent guard
    if (this.loading() || this.done()) return;

    this.loading.set(true);
    const skip = this.visibleProducts().length;

    this.productsService
      .getProductsPage(this.pageSize, skip)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (batch) => {
          // Hết dữ liệu khi mảng rỗng hoặc < pageSize
          if (!batch || batch.length < this.pageSize) this.done.set(true);
          // GỘP đúng cú pháp (đã sửa)
          this.visibleProducts.update((curr) => [...curr, ...(batch ?? [])]);
        },
        error: () => this.done.set(true),
        complete: () => this.loading.set(false),
      });
  }

  ngOnDestroy() {
    // Nếu favouriteIds thay đổi so với store -> dispatch cập nhật
    const currentIds = this.favouriteIds();
    const storedIds = this.lastStoredFavouriteIds ?? [];
    const same =
      currentIds.length === storedIds.length && currentIds.every((v, i) => v === storedIds[i]);

    if (!same) {
      const idSet = new Set(currentIds);
      const productsToStore = this.visibleProducts().filter((p) => idSet.has(p.id));
      this.store.dispatch(updateFavouriteProducts({ products: productsToStore }));
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
