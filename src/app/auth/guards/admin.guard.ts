import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    localStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  alert('⛔ Acesso negado! Esta funcionalidade é apenas para administradores.');
  router.navigate(['/produtos']);
  return false;
};