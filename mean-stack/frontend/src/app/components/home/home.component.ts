import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  
  featuredProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  
  // Propiedad para el producto seleccionado en el modal
  selectedProduct: Product | null = null;
  
  ngOnInit(): void {
    this.loadFeaturedProducts();
  }
  
  loadFeaturedProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        // Ordenar por stock descendente y tomar los 3 primeros
        this.featuredProducts = products
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.error = 'No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.';
        this.loading = false;
      }
    });
  }
  
  /**
   * Abre el modal con la información del producto seleccionado
   */
  openProductModal(product: Product): void {
    this.selectedProduct = product;
    // Prevenir scroll mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Cierra el modal del producto
   */
  closeProductModal(): void {
    this.selectedProduct = null;
    // Restaurar scroll
    document.body.style.overflow = '';
  }

  /**
   * Abre WhatsApp con un mensaje predeterminado incluyendo el nombre del producto
   */
  contactViaWhatsApp(product: Product | null = this.selectedProduct): void {
    if (!product) return;
    const phone = '56950476935'; // sin '+'
    const text = `Quiero mas informacion de ${product.name}`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
  }
}
