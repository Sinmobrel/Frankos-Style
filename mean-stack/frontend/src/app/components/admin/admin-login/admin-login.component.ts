import { Component, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isSubmitting = false;
  errorMessage: string | null = null;
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    
    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Guardar el token en localStorage (solo en el navegador)
        if (this.isBrowser && response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        
        // Redirigir a la página de administración de productos
        this.router.navigate(['/admin/productos']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        console.error('Login error:', err);
      }
    });
  }

  // Función auxiliar para marcar todos los campos del formulario como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched({ onlySelf: true });
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Mostrar error si el campo está tocado o el formulario fue enviado
  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && (control.touched || this.isSubmitting) && control.hasError(errorName));
  }
}