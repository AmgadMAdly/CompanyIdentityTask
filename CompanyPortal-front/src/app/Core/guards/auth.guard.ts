import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Services/Auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and token is not expired
  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    return true;
  }

  // If not authenticated or token is expired, redirect to login
  router.navigate(['/login']);
  return false;
};
