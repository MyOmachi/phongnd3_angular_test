import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProductService } from '../../services/products.service';
import { combineLatest, map, shareReplay, take, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductsListComponent } from '../shared/products-list/products-list.component';

@Component({
  selector: 'app-favourites.component',
  imports: [AsyncPipe, MatButtonModule, MatIconModule, ProductsListComponent],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesComponent {
  private store = inject(Store);
  private productService = inject(ProductService);

  favIds = signal<number[]>([]);
  private lastStoredFavIds: number[] = [];
  private products$ = this.productService.getAllProducts();

  private storedFavIds$ = this.store.select(selectFavouriteProductIds).pipe(
    tap((ids) => {
      this.lastStoredFavIds = [...ids];
      this.favIds.set([...ids]);
    })
  );

  visibleProducts$ = combineLatest([this.products$, this.storedFavIds$]).pipe(
    map(([products, stickyIds]) => products.filter((p) => stickyIds.includes(p.id)))
  );

  ngOnDestroy() {
    const currentIds = this.favIds();
    const storedIds = this.lastStoredFavIds || [];
    const isEqual =
      currentIds.length === storedIds.length && currentIds.every((v, i) => v === storedIds[i]);
    if (!isEqual) {
      this.store.dispatch(updateFavourite({ favouriteProductIds: currentIds }));
    }
  }
}
