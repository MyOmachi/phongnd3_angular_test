import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ProductService } from '../../services/products.service';
import { selectFavouriteProductIds } from '../../store/favourite/favourite.selectors';
import { updateFavourite } from '../../store/favourite/favourite.actions';
import { ProductsListComponent } from '../shared/products-list/products-list.component';

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
  favIds = signal<number[]>([]);

  products$ = this.productService.getAllProducts();

  ngOnInit() {
    this.store.select(selectFavouriteProductIds).subscribe((ids) => {
      this.favIds.set([...ids]);
    });
  }

  ngOnDestroy() {
    this.store.dispatch(updateFavourite({ favouriteProductIds: this.favIds() }));
  }
}
