import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { ProductService } from '../../services/products.service';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private productService = inject(ProductService);

  products$ = this.productService.getAllProduct();
  favIds: number[] = [];

  ngOnInit() {
    this.store.select(selectFavouriteProductIds).subscribe((ids) => {
      this.favIds = [...ids];
    });
  }

  toggleFavourite(id: number) {
    this.favIds = this.favIds.includes(id)
      ? this.favIds.filter((x) => x !== id)
      : [...this.favIds, id];
  }

  isFav(id: number) {
    return this.favIds.includes(id);
  }

  ngOnDestroy() {
    this.store.dispatch(updateFavourite({ favouriteProductIds: this.favIds }));
  }
}
