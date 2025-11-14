import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ProductModalService } from '../../services/product-modal.service';
import { Product } from '../../models/product.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private apiService = inject(ApiService);
  productModal = inject(ProductModalService);
  products: Product[] = []; // Productos filtrados
  allProducts: Product[] = []; // Todos los productos
  filteredProducts: Product[] = []; // Productos de la página actual
  loading = true;
  error: string | null = null;
  
  // Exponer Math para usar en template
  Math = Math;
  
  // Propiedades para paginación
  currentPage = 1;
  pageSize = 12;
  totalProducts = 0;
  hasMore = false;
  
  // Propiedades para filtros
  filterName: string = '';
  filterCategory: string = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;
  
  /**
   * Resetea todos los filtros a sus valores por defecto
   */
  resetFilters(): void {
    this.filterName = '';
    this.filterCategory = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.currentPage = 1;
    this.applyFilters();
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
    this.productModal.openModal(product);
  }
  
  /**
   * Cierra el modal del producto
   */
  closeProductModal(): void {
    this.productModal.closeModal();
  }

  /**
   * Abre WhatsApp en una nueva pestaña con un mensaje precargado
   * que incluye el nombre del producto seleccionado.
   */
  contactViaWhatsApp(product: Product | null = this.productModal.selectedProduct): void {
    if (!product) return;
    const phone = '56950476935'; // Número configurado para contacto
    const text = `Quiero mas informacion de ${product.name}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  ngOnInit() {
    this.loadAllProducts();
  }

  /**
   * Carga TODOS los productos de una vez para filtrado local
   */
  loadAllProducts(): void {
    this.loading = true;
    this.error = null;
    
    // Solicitar todos los productos con stock (false = solo productos con stock > 0)
    this.apiService.getProducts(false)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (products) => {
          console.log('📦 Productos cargados:', products.length);
          this.allProducts = products;
          this.applyFilters(); // Aplicar filtros después de cargar
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.error = 'No se pudieron cargar los productos';
          this.allProducts = [];
          this.filteredProducts = [];
        }
      });
  }

  /**
   * Aplica filtros localmente a todos los productos
   */
  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Filtro por nombre (busca en nombre y descripción)
    if (this.filterName.trim()) {
      const searchTerm = this.filterName.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por categoría
    if (this.filterCategory) {
      filtered = filtered.filter(p =>
        this.matchesProductCategory(p.category, this.filterCategory)
      );
    }

    // Filtro por precio mínimo
    if (this.filterMinPrice !== null && this.filterMinPrice > 0) {
      filtered = filtered.filter(p => p.price >= this.filterMinPrice!);
    }

    // Filtro por precio máximo
    if (this.filterMaxPrice !== null && this.filterMaxPrice > 0) {
      filtered = filtered.filter(p => p.price <= this.filterMaxPrice!);
    }

    // Actualizar productos filtrados
    this.products = filtered;
    this.totalProducts = filtered.length;
    
    // Resetear a página 1 cuando se aplican filtros
    this.currentPage = 1;
    
    // Aplicar paginación local
    this.updatePaginatedProducts();
  }

  /**
   * Actualiza los productos de la página actual
   */
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredProducts = this.products.slice(startIndex, endIndex);
    
    console.log(`📄 Página ${this.currentPage}: Mostrando ${this.filteredProducts.length} de ${this.totalProducts} productos`);
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navegación de paginación - Ir a una página específica
   */
  goToPage(page: number): void {
    if (page === -1 || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  /**
   * Página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  /**
   * Página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  /**
   * Calcular el número total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  /**
   * Generar array de números de página para mostrar
   */
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (this.currentPage <= 3) {
        // Cerca del inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Elipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Cerca del final
        pages.push(1);
        pages.push(-1); // Elipsis
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push(-1); // Elipsis
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Elipsis
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  /**
   * Obtiene la URL de la imagen del producto con fallback
   */
  getProductImageUrl(product: Product): string {
    if (product.imageUrl) {
      // Si la imagen viene de Cloudinary o es una URL completa, usarla directamente
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('//')) {
        return product.imageUrl;
      }
      // Si es una ruta relativa, asegurar que tenga el prefijo correcto
      if (product.imageUrl.startsWith('/uploads/') || product.imageUrl.startsWith('uploads/')) {
        return product.imageUrl.startsWith('/') ? product.imageUrl : '/' + product.imageUrl;
      }
    }
    // Fallback a imagen placeholder
    return '/assets/images/placeholder.svg';
  }

  /**
   * Maneja errores de carga de imagen
   */
  onImageError(event: any): void {
    event.target.src = '/assets/images/placeholder.svg';
  }
}
