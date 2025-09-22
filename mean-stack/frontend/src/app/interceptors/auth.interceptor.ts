import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  
  // Si no estamos en el navegador, no podemos acceder a localStorage
  if (!isBrowser) {
    return next(req);
  }
  
  // Obtener el token de localStorage
  const token = localStorage.getItem('auth_token');
  
  // Si hay un token disponible y la solicitud va hacia la API
  if (token && req.url.includes('/api/')) {
    // Clonar la solicitud y añadir el encabezado de autorización
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Enviar la solicitud modificada
    return next(authReq);
  }
  
  // Si no hay token o la solicitud no es para la API, continuar sin modificaciones
  return next(req);
};