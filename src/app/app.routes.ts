import { Routes } from '@angular/router';
import { ProductsComponent } from './features/products/products.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './guards/auth.guard';
import { FavouritesComponent } from './features/favourites/favourites.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'favourites', component: FavouritesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'products' },
];
