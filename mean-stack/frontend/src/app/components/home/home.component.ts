import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ProductModalService } from '../../services/product-modal.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private productModal = inject(ProductModalService);
  
  featuredProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  showSizeGuide = false;

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }  loadFeaturedProducts(): void {
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
    this.productModal.openModal(product);
  }

  /**
   * Abre WhatsApp con un mensaje predeterminado incluyendo el nombre del producto
   */
  contactViaWhatsApp(product: Product): void {
    if (!product) return;
    const phone = '56950476935'; // sin '+'
    const text = `Quiero mas informacion de ${product.name}`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
  }

  /**
   * Abre WhatsApp con un mensaje general de consulta
   */
  contactViaWhatsAppGeneral(): void {
    const phone = '56950476935'; // sin '+'
    const text = `Hola! Me interesa conocer más sobre sus productos de Franko's Style. ¿Podrían brindarme información?`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
  }

  /**
   * Retorna la clase CSS basada en la categoría del producto
   */
  getCategoryClass(category: string): string {
    if (!category) return '';
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('traje')) {
      return 'category-trajes';
    } else if (categoryLower.includes('short') || categoryLower.includes('evening')) {
      return 'category-short-fit';
    } else if (categoryLower.includes('luxury') || categoryLower.includes('premium')) {
      return 'category-luxury';
    } else if (categoryLower.includes('camisa')) {
      return 'category-camisas';
    } else if (categoryLower.includes('accesorio')) {
      return 'category-accesorios';
    }
    
    return '';
  }

  /**
   * Abre el modal de guía de tallas
   */
  openSizeGuide(): void {
    this.showSizeGuide = true;
    document.body.classList.add('modal-open');
  }

  /**
   * Cierra el modal de guía de tallas
   */
  closeSizeGuide(): void {
    this.showSizeGuide = false;
    document.body.classList.remove('modal-open');
  }

  /**
   * Abre el chatbot CarVian haciendo click programático en la burbuja
   */
  openChatbot(): void {
    const bubble = document.querySelector<HTMLButtonElement>('.chatbot-bubble');
    bubble?.click();
  }
}
