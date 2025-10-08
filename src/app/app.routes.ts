import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { unknownRedirectGuard } from './guards/unknown-redirect.guard';
import { NotFoundRedirectComponent } from './features/not-found-redirect/not-found-redirect.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then((m) => m.ProductsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'favourites',
    loadComponent: () =>
      import('./features/favourites/favourites.component').then((m) => m.FavouritesComponent),
    canActivate: [authGuard],
  },
  { path: '**', canActivate: [unknownRedirectGuard], component: NotFoundRedirectComponent },
];
