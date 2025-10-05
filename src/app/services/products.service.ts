import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/products`;

  getAllProduct() {
    return this.http.get<ProductsResponse>(this.url).pipe(map((r) => r.products));
  }
}
