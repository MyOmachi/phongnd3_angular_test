// favourites.component.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/products.service';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { ProductsListComponent } from '../../shared/components/products-list/products-list.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll/infinite-scroll.directive';

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
  private productService = inject(ProductService);

  private pageSize = 12;
  favIds = signal<number[]>([]);
  private lastStoredFavIds: number[] = [];
  private allProducts = signal<Product[] | null>(null);
  items = signal<Product[]>([]);
  loading = signal<boolean>(true);
  done = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.store.select(selectFavouriteProductIds).subscribe((ids) => {
      this.lastStoredFavIds = ids ? [...ids] : [];
      this.favIds.set(ids ? [...ids] : []);
      this.maybeResetAndPrime();
    });

    this.productService.getAllProducts().subscribe({
      next: (list) => {
        this.allProducts.set(list ?? []);
        this.maybeResetAndPrime();
      },
      error: () => {
        this.allProducts.set([]);
        this.maybeResetAndPrime();
      },
    });
  }

  private maybeResetAndPrime() {
    if (this.allProducts() === null) return;
    this.items.set([]);
    this.done.set(false);
    this.loading.set(false);
    if (this.filteredAll().length === 0) {
      this.done.set(true);
      return;
    }
    this.loadMore();
  }

  private filteredAll(): Product[] {
    const all = this.allProducts();
    const ids = this.favIds();
    if (!all || ids.length === 0) return [];
    const set = new Set(ids);
    return all.filter((p) => set.has(p.id));
  }

  loadMore() {
    if (this.loading() || this.done()) return;
    this.loading.set(true);
    const all = this.filteredAll();
    const curr = this.items().length;
    const next = all.slice(curr, curr + this.pageSize);
    this.items.update((prev) => [...prev, ...next]);
    if (curr + next.length >= all.length) this.done.set(true);
    this.loading.set(false);
  }

  ngOnDestroy() {
    const a = this.favIds(),
      b = this.lastStoredFavIds ?? [];
    const same = a.length === b.length && a.every((v, i) => v === b[i]);
    if (!same) this.store.dispatch(updateFavourite({ favouriteProductIds: a }));
  }
}
