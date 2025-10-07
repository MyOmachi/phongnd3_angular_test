import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/products`;

  getAllProducts() {
    return this.http.get<ProductsResponse>(this.url).pipe(map((r) => r.products));
  }

  getProductsPage(limit = 12, skip = 0) {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<ProductsResponse>(this.url, { params }).pipe(map((r) => r.products));
  }
}
