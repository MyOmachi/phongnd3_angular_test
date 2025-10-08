import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ProductsListComponent } from '../../shared/components/products-list/products-list.component';
import { selectFavouriteProducts } from '../../store/favourite/favourite.selectors';
import { updateFavouriteProducts } from '../../store/favourite/favourite.actions';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll/infinite-scroll.directive';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-favourites.component',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductsListComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesComponent {
  private store = inject(Store);
  private pageSize = 12;

  favouriteIds = signal<number[]>([]);
  private lastStoredFavouriteIds: number[] = [];

  sourceProducts = signal<Product[]>([]);
  visibleProducts = signal<Product[]>([]);
  loading = signal(false);
  done = signal(false);

  constructor() {}

  ngOnInit() {
    this.store.select(selectFavouriteProducts).subscribe((list) => {
      const all = list ?? [];
      this.sourceProducts.set(all);
      this.visibleProducts.set([]);
      this.done.set(false);
      this.loading.set(false);

      this.lastStoredFavouriteIds = all.map((p) => p.id);
      this.favouriteIds.set(this.lastStoredFavouriteIds.slice());

      if (all.length === 0) {
        this.done.set(true);
        return;
      }
      this.loadMore();
    });
  }

  loadMore() {
    if (this.loading() || this.done()) return;
    this.loading.set(true);

    const all = this.sourceProducts();
    const current = this.visibleProducts().length;
    const next = all.slice(current, current + this.pageSize);

    this.visibleProducts.update((prev) => [...prev, ...next]);
    if (current + next.length >= all.length) this.done.set(true);

    this.loading.set(false);
  }

  ngOnDestroy() {
    const ids = this.favouriteIds();
    const prev = this.lastStoredFavouriteIds ?? [];
    const same = ids.length === prev.length && ids.every((v, i) => v === prev[i]);
    if (!same) {
      const idSet = new Set(ids);
      const updated = this.sourceProducts().filter((p) => idSet.has(p.id));
      this.store.dispatch(updateFavouriteProducts({ products: updated }));
    }
  }
}
