import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  products = input.required<Product[]>();
  favIds = model<number[]>([]);

  isFav = (id: number) => this.favIds().includes(id);

  toggleFavourite(id: number) {
    const curr = this.favIds();
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    this.favIds.set(next);
  }
}
