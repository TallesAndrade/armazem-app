// src/app/auth/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // ✅ Se tem token, adiciona no header
  if (token) {
    console.log('🔑 Adicionando token no header da requisição para:', req.url);
    
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  } else {
    console.warn('⚠️ Nenhum token encontrado para a requisição:', req.url);
  }

  return next(req).pipe(
    catchError(error => {
      console.error('❌ Erro na requisição:', error.status, error.message);
      
      // Se 401 ou 403, faz logout
      if (error.status === 401 || error.status === 403) {
        console.warn('🚪 Sessão expirada ou sem permissão - fazendo logout');
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};