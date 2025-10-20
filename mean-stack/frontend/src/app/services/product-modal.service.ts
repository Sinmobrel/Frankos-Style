import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductModalService {
  private selectedProductSubject = new BehaviorSubject<Product | null>(null);
  public selectedProduct$ = this.selectedProductSubject.asObservable();
  
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  constructor() { }

  /**
   * Abre el modal con el producto especificado
   */
  openModal(product: Product): void {
    this.selectedProductSubject.next(product);
    this.isOpenSubject.next(true);
    // Prevenir scroll mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.selectedProductSubject.next(null);
    this.isOpenSubject.next(false);
    // Restaurar scroll
    document.body.style.overflow = '';
  }

  /**
   * Obtiene el producto seleccionado actual
   */
  get selectedProduct(): Product | null {
    return this.selectedProductSubject.value;
  }

  /**
   * Obtiene el estado actual del modal
   */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}