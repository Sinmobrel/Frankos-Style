import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage, Product } from '../../services/chatbot.service';
import { ProductModalService } from '../../services/product-modal.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit {
  chatbot = inject(ChatbotService);
  productModal = inject(ProductModalService);
  
  chatbotActive = false;
  messageText = '';
  messages: ChatMessage[] = [];
  loading = false;

  ngOnInit(): void {
    this.messages = this.chatbot.getHistory();
  }

  toggleChatbot() {
    this.chatbotActive = !this.chatbotActive;
  }

  async sendMessage() {
    const text = (this.messageText || '').trim();
    if (!text) return;
    
    this.messageText = '';
    this.loading = true;

    try {
      await this.chatbot.send(text);
      // Actualizar mensajes desde el historial del servicio
      this.messages = this.chatbot.getHistory();
    } catch (err) {
      console.error('Chatbot error:', err);
      // El servicio ya maneja los errores y agrega mensajes fallback
      // Solo actualizamos la vista
      this.messages = this.chatbot.getHistory();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Abre el modal del producto desde el chatbot
   */
  openProductModal(product: Product): void {
    this.productModal.openModal(product);
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