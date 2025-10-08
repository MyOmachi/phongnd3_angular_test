import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './products-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  products = input<Product[]>([]);
  favouriteIds = model<number[]>([]);
  viewed = output<number>();

  isFavourite = (id: number) => this.favouriteIds().includes(id);

  toggleFavourite(id: number) {
    const current = this.favouriteIds();
    this.favouriteIds.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  viewProduct(id: number) {
    this.viewed.emit(id);
  }
}
