import { Component, OnInit, inject, isDevMode } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Product } from '../../../models/product.model';
import { HttpClient } from '@angular/common/http';

// Importar apiBaseUrl de forma dinámica
const apiBaseUrl = isDevMode() 
  ? 'http://localhost:3000/api' 
  : 'https://backend-frankos-style.vercel.app/api';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CurrencyPipe],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  productForm: FormGroup;
  editMode = false;
  currentProductId: string | null = null;
  
  // Propiedades para la carga de imágenes
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadProgress: number = 0;
  
  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.error = 'No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.';
        this.loading = false;
      }
    });
  }
  
  // El método onSubmit ha sido reemplazado por la versión con carga de archivos
  
  editProduct(product: Product): void {
    this.editMode = true;
    this.currentProductId = product._id || null;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock
    });
  }
  
  deleteProduct(id: string): void {
    if (confirm('¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer.')) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error eliminando producto:', err);
          this.error = 'No se pudo eliminar el producto. Por favor, intente de nuevo.';
        }
      });
    }
  }
  
  resetForm(): void {
    this.editMode = false;
    this.currentProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadProgress = 0;
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      stock: 0
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      
      // Actualizar el valor del campo imageUrl con un nombre temporal
      // El archivo real se subirá cuando se envíe el formulario
      this.productForm.patchValue({
        imageUrl: URL.createObjectURL(this.selectedFile)
      });
    }
  }
  
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.patchValue({ imageUrl: '' });
  }
  
  // Método para subir la imagen al servidor
  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        resolve(this.productForm.get('imageUrl')?.value || '');
        return;
      }

      // Subida directa a Cloudinary
      const cloudName = 'dwzo5pgb6'; // Reemplaza por tu cloud_name
      const uploadPreset = 'unsigned_preset'; // Crea un preset en Cloudinary para uploads sin autenticación
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('upload_preset', uploadPreset);

      this.http.post<any>(url, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: any) => {
          if (event.type === 4) {
            if (event.body && event.body.secure_url) {
              resolve(event.body.secure_url);
            } else {
              reject('No se recibió la URL de la imagen');
            }
          } else if (event.type === 1) {
            if (event.total) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            }
          }
        },
        error: (err) => {
          console.error('Error subiendo la imagen a Cloudinary:', err);
          reject(err);
        }
      });
    });
  }
  
  // Sobrescribimos el método onSubmit para manejar la carga de imágenes
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    
    // Primero subimos la imagen si hay alguna
    this.uploadImage().then(imageUrl => {
      const productData = {...this.productForm.value, imageUrl} as Product;

      if (this.editMode && this.currentProductId) {
        this.apiService.updateProduct(this.currentProductId, productData).subscribe({
          next: () => {
            this.resetForm();
            this.loadProducts();
          },
          error: (err) => {
            console.error('Error actualizando producto:', err);
            this.error = 'No se pudo actualizar el producto. Por favor, intente de nuevo.';
          }
        });
      } else {
        this.apiService.createProduct(productData).subscribe({
          next: () => {
            this.resetForm();
            this.loadProducts();
          },
          error: (err) => {
            console.error('Error creando producto:', err);
            this.error = 'No se pudo crear el producto. Por favor, intente de nuevo.';
          }
        });
      }
    }).catch(err => {
      this.error = 'Error al subir la imagen a Cloudinary. Por favor, intente de nuevo.';
      console.error(err);
    });
  }
}
