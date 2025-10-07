import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const unknownRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log(!!authService.getAccessToken());

  return !!authService.getAccessToken() ? router.parseUrl('/products') : router.parseUrl('/login');
};
