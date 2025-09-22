import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  
  // Si estamos en el servidor, no podemos verificar la autenticación
  if (!isBrowser) {
    return false; // En SSR, redirigir a login (se manejará en el cliente)
  }
  
  // Verificar si hay un token almacenado
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Si no hay token, redirigir al login
    router.navigate(['/admin/login']);
    return false;
  }
  
  // Verificar con el backend si el token es válido
  return apiService.testAuth().pipe(
    map(response => {
      // Si la respuesta es exitosa, permitir el acceso
      return true;
    }),
    catchError(err => {
      // Si hay error (token inválido), redirigir al login
      console.error('Auth error:', err);
      if (isBrowser) {
        localStorage.removeItem('auth_token');
      }
      router.navigate(['/admin/login']);
      return of(false);
    })
  );
};