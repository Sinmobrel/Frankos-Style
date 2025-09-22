import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private apiService = inject(ApiService);
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  
  // Propiedad para el producto seleccionado (modal)
  selectedProduct: Product | null = null;
  
  // Propiedades para filtros
  filterName: string = '';
  filterCategory: string = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;

  // Getter para productos filtrados
  get filteredProducts(): Product[] {
    if (!this.products || !Array.isArray(this.products)) return [];
    return this.products.filter(product => {
      // Filtro por nombre
      const matchesName = this.filterName.trim() === '' || (product.name && product.name.toLowerCase().includes(this.filterName.toLowerCase()));

      // Filtro por categoría
      const matchesCategory = this.filterCategory.trim() === '' || this.matchesProductCategory(product.category, this.filterCategory);

      // Filtro por precio mínimo
      const productPrice = Number(product.price);
      const matchesMinPrice = this.filterMinPrice === null || isNaN(productPrice) || productPrice >= this.filterMinPrice;

      // Filtro por precio máximo
      const matchesMaxPrice = this.filterMaxPrice === null || isNaN(productPrice) || productPrice <= this.filterMaxPrice;

      return matchesName && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }
  
  /**
   * Resetea todos los filtros a sus valores por defecto
   */
  resetFilters(): void {
    this.filterName = '';
    this.filterCategory = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
  }

  /**
   * Compara la categoría del producto con el valor seleccionado en el filtro
   * Considera las variaciones plurales/singulares y mapea los valores
   */
  private matchesProductCategory(productCategory: string, filterCategory: string): boolean {
    // Mapeo de categorías del filtro a posibles valores en la base de datos
    const categoryMap: Record<string, string[]> = {
      'traje': ['traje', 'trajes'],
      'camisa': ['camisa', 'camisas'],
      'corbata': ['corbata', 'corbatas'],
      'zapato': ['zapato', 'zapatos'],
      'accesorio': ['accesorio', 'accesorios']
    };
    
    // Si la categoría del filtro está en nuestro mapa
    if (categoryMap[filterCategory]) {
      // Verifica si la categoría del producto está en los valores posibles
      return categoryMap[filterCategory].includes(productCategory.toLowerCase());
    }
    
    // Si no encontramos un mapeo, hacemos una comparación directa
    return productCategory.toLowerCase() === filterCategory.toLowerCase();
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
   * Abre WhatsApp en una nueva pestaña con un mensaje precargado
   * que incluye el nombre del producto seleccionado.
   */
  contactViaWhatsApp(product: Product | null = this.selectedProduct): void {
    if (!product) return;
    const phone = '56950476935'; // Número configurado para contacto
    const text = `Quiero mas informacion de ${product.name}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  ngOnInit() {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        
        // Mostrar las categorías únicas para depuración
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        console.log('Categorías disponibles:', uniqueCategories);
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
      }
    });
  }
}
