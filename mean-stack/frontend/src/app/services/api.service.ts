import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID, Inject, isDevMode } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

// Importar environment de forma dinámica basado en el modo de compilación
const apiBaseUrl = isDevMode() 
  ? 'http://localhost:3000/api' 
  : 'https://backend-frankos-style.vercel.app/api';

// Interfaces para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Interface para respuesta de productos con paginación
export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasMore: boolean;
    productsPerPage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = apiBaseUrl;
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  
  // BehaviorSubject para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // Verificar si hay un token almacenado
  private hasValidToken(): boolean {
    if (!this.isBrowser) {
      return false; // No hay token en el servidor
    }
    const token = localStorage.getItem('auth_token');
    return !!token; // Devuelve true si existe un token
  }
  
  // Obtener el token para las peticiones autenticadas
  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders(); // Headers vacíos en el servidor
    }
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // User API calls
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
  
  // Autenticación API calls
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Al recibir respuesta exitosa, actualizar el estado de autenticación
          if (this.isBrowser && response && response.token) {
            localStorage.setItem('auth_token', response.token);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }
  
  logout(): void {
    // Eliminar token y actualizar estado de autenticación
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
    }
    this.isAuthenticatedSubject.next(false);
  }
  
  testAuth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/test`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Product API calls
  
  // Método con paginación (recomendado para catálogo)
  getProductsPaginated(page: number = 1, limit: number = 12): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      `${this.apiUrl}/products?page=${page}&limit=${limit}`
    );
  }

  // Método original sin paginación (para compatibilidad con admin y home)
  // Admin: incluye productos sin stock
  // Home: solo productos con stock
  getProducts(includeOutOfStock: boolean = true): Observable<Product[]> {
    const params = includeOutOfStock 
      ? 'limit=1000&includeOutOfStock=true'  // Admin: todos los productos
      : 'limit=1000';                         // Home: solo con stock
    
    return this.http.get<any>(`${this.apiUrl}/products?${params}`)
      .pipe(
        map(response => {
          console.log('📦 getProducts response:', response);
          // Si la respuesta tiene estructura de paginación, extraer solo los productos
          if (response && typeof response === 'object' && 'products' in response && Array.isArray(response.products)) {
            console.log('✅ Extrayendo array de productos:', response.products.length);
            return response.products;
          }
          // Si es un array directo, retornarlo tal cual
          if (Array.isArray(response)) {
            console.log('✅ Respuesta es array directo:', response.length);
            return response;
          }
          console.warn('⚠️ Respuesta inesperada, retornando array vacío');
          return [];
        })
      );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Product): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Test API connection
  testApi(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }
}
