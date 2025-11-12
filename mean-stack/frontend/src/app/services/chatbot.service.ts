import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';

// Interfaces para el chat
export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  products?: Product[];
  contactInfo?: {
    phone: string;
    whatsappLink: string;
  };
}

// Re-export para mantener compatibilidad
export type { Product };

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private history: ChatMessage[] = [
    { from: 'bot', text: '¡Hola! Soy CarVian, tu asistente personal de moda en Franko\'s Style. Estoy aquí para ayudarte a encontrar el outfit perfecto. ¿Qué estás buscando hoy?' }
  ];
  
  // Determinar la URL base de la API
  private apiUrl = isDevMode() 
    ? 'http://localhost:3000/api' 
    : 'https://backend-frankos-style.vercel.app/api';

  getHistory(): ChatMessage[] { 
    return this.history; 
  }

  async send(text: string): Promise<void> {
    // Agregar mensaje del usuario al historial
    this.history.push({ from: 'user', text });
    
    try {
      // Enviar mensaje y historial previo para contexto
      const response = await this.http.post<{
        reply: string, 
        products?: Product[], 
        fallback?: boolean,
        contactInfo?: { phone: string; whatsappLink: string; }
      }>(`${this.apiUrl}/chat`, { 
        message: text,
        history: this.history.slice(0, -1) // Enviar historial sin el último mensaje de usuario
      }).toPromise();
      
      const reply = response?.reply || 'Sin respuesta del servidor';
      const products = response?.products;
      const contactInfo = response?.contactInfo;
      
      // Debug: verificar contactInfo solo cuando existe
      if (contactInfo) {
        console.log('📞 ContactInfo recibido del backend:', contactInfo);
      } else {
        console.log('ℹ️ Sin contactInfo en esta respuesta (normal si no es consulta de contacto)');
      }
      
      this.history.push({ 
        from: 'bot', 
        text: reply,
        products: products,
        contactInfo: contactInfo // Solo se agrega si existe (undefined si no)
      });
      
      // Log si está usando fallback
      if (response?.fallback) {
        console.warn('ChatbotService: Usando respuesta fallback, Groq no disponible');
      }
      
    } catch (err) {
      console.error('ChatbotService error:', err);
      
      // Respuesta de fallback si el backend no está disponible
      const fallbackResponses = [
        'Disculpa, tengo problemas de conexión. Te puedo ayudar con información sobre nuestros productos de moda masculina.',
        'Franko\'s Style se especializa en trajes, camisas, corbatas y accesorios elegantes.',
        'Puedes explorar nuestro catálogo para ver toda nuestra colección.',
        'Si necesitas ayuda específica, nuestro equipo estará disponible pronto.',
        'Gracias por contactar a Franko\'s Style. Estamos trabajando para mejorar nuestro servicio.'
      ];
      
      const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      this.history.push({ from: 'bot', text: fallback });
    }
  }

  /**
   * Reinicia el historial del chat (útil para limpiar conversaciones)
   */
  clearHistory(): void {
    this.history = [
      { from: 'bot', text: '¡Hola! Soy CarVian, tu asistente personal de moda en Franko\'s Style. Estoy aquí para ayudarte a encontrar el outfit perfecto. ¿Qué estás buscando hoy?' }
    ];
    console.log('🧹 Historial del chat limpiado');
  }
}