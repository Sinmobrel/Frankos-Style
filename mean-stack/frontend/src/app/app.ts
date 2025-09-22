import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
// Eliminamos la importación redundante de HttpClientModule, ya que provideHttpClient ya está en app.config.ts
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // Eliminamos HttpClientModule redundante
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('MEAN Stack App');
  
  private apiService = inject(ApiService);
  
  apiStatus = 'Checking connection to API...';
  currentYear = new Date().getFullYear();
  chatbotActive = false; // Estado para controlar la visibilidad del chatbot

  ngOnInit() {
    this.checkApiConnection();
  }
  
  /**
   * Muestra u oculta el panel del chatbot
   */
  toggleChatbot() {
    this.chatbotActive = !this.chatbotActive;
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
}
