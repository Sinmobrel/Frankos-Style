import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ApiService } from './services/api.service';
import { ProductModalService } from './services/product-modal.service';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    ChatbotComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('MEAN Stack App');
  
  private apiService = inject(ApiService);
  productModal = inject(ProductModalService);
  
  apiStatus = 'Checking connection to API...';
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.checkApiConnection();
  }

  checkApiConnection() {
    this.apiService.testApi().subscribe({
      next: (response) => {
        this.apiStatus = response.message || 'Connected to API';
      },
      error: (error) => {
        console.error('API connection error:', error);
        this.apiStatus = 'Failed to connect to API. Check if backend server is running.';
      }
    });
  }

  /**
   * Abre WhatsApp en una nueva pestaña con un mensaje precargado
   * que incluye el nombre del producto seleccionado.
   */
  contactViaWhatsApp(product: Product): void {
    if (!product) return;
    const phone = '56950476935'; // Número configurado para contacto
    const text = `Quiero más información de ${product.name}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
