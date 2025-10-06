import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
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
export class ProductsComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private productService = inject(ProductService);

  products$ = this.productService.getAllProducts();
  favIds = signal<number[]>([]);

  ngOnInit() {
    this.store.select(selectFavouriteProductIds).subscribe((ids) => {
      this.favIds.set([...ids]);
    });
  }

  ngOnDestroy() {
    this.store.dispatch(updateFavourite({ favouriteProductIds: this.favIds() }));
  }
}
