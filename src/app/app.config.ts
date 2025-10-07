import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { favouriteProductsReducer } from './store/favourite/favourite.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({ user: userReducer, favouritesProducts: favouriteProductsReducer }),
    provideEffects([UserEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
