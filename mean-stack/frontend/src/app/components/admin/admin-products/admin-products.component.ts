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
  isUploading = false;
  
  // Manejo de errores mejorado
  fieldErrors: { [key: string]: string } = {};
  successMessage: string | null = null;
  
  constructor() {
    this.productForm = this.fb.group({
      // Campos básicos con validaciones que coinciden con el backend
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(99999999)]],
      imageUrl: ['', Validators.required],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(99999)]],
      
      // Campos técnicos nuevos
      productType: [''],
      cut: [''],
      sizesText: [''],
      mainColor: [''],
      material: [''],
      priceRange: [''],
      occasion: [''],
      
      // Campos de marketing
      featured: [false],
      isPopular: [false],
      isExclusive: [false],
      
      // Medidas (como strings para simplicidad)
      measurementLength: [''],
      measurementShoulders: [''],
      measurementWaist: [''],
      
      // Arrays como strings separados por comas
      colorsArray: [''], // Se convertirá a array
      eventTypesArray: [''], // Se convertirá a array
      includesArray: [''] // Se convertirá a array
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
      // Campos básicos
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      
      // Campos técnicos
      productType: product.productType || '',
      cut: product.cut || '',
      sizesText: product.sizesText || '',
      mainColor: product.mainColor || '',
      material: product.material || '',
      priceRange: product.priceRange || '',
      occasion: product.occasion || '',
      
      // Campos de marketing
      featured: product.featured || false,
      isPopular: product.isPopular || false,
      isExclusive: product.isExclusive || false,
      
      // Medidas
      measurementLength: product.measurements?.length || '',
      measurementShoulders: product.measurements?.shoulders || '',
      measurementWaist: product.measurements?.waist || '',
      
      // Arrays como strings
      colorsArray: product.colors?.join(', ') || '',
      eventTypesArray: product.eventTypes?.join(', ') || '',
      includesArray: product.includes?.join(', ') || ''
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
    this.isUploading = false;
    this.clearMessages();
    
    this.productForm.reset({
      // Campos básicos
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      stock: 0,
      
      // Campos técnicos
      productType: '',
      cut: '',
      sizesText: '',
      mainColor: '',
      material: '',
      priceRange: '',
      occasion: '',
      
      // Campos de marketing
      featured: false,
      isPopular: false,
      isExclusive: false,
      
      // Medidas
      measurementLength: '',
      measurementShoulders: '',
      measurementWaist: '',
      
      // Arrays
      colorsArray: '',
      eventTypesArray: '',
      includesArray: ''
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.clearMessages(); // Limpiar mensajes previos
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.fieldErrors['image'] = 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG o WebP.';
        input.value = ''; // Limpiar el input
        return;
      }

      // Validar tamaño de archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        this.fieldErrors['image'] = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB.';
        input.value = ''; // Limpiar el input
        return;
      }
      
      this.selectedFile = file;
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.onerror = () => {
        this.fieldErrors['image'] = 'Error al leer el archivo de imagen.';
        this.selectedFile = null;
        this.imagePreview = null;
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
  
  // Método para subir la imagen al servidor con validaciones mejoradas
  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        const existingImageUrl = this.productForm.get('imageUrl')?.value;
        if (existingImageUrl && existingImageUrl.trim()) {
          resolve(existingImageUrl);
        } else {
          reject('No se ha seleccionado ninguna imagen');
        }
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        reject('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG o WebP.');
        return;
      }

      // Validar tamaño de archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (this.selectedFile.size > maxSize) {
        reject('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.');
        return;
      }

      // Subida directa a Cloudinary
      const cloudName = 'dwzo5pgb6'; // Reemplaza por tu cloud_name
      const uploadPreset = 'unsigned_preset'; // Crea un preset en Cloudinary para uploads sin autenticación
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('upload_preset', uploadPreset);

      this.uploadProgress = 0;

      this.http.post<any>(url, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: any) => {
          if (event.type === 4) {
            this.uploadProgress = 100;
            if (event.body && event.body.secure_url) {
              resolve(event.body.secure_url);
            } else {
              reject('Error del servidor de imágenes: No se recibió la URL de la imagen');
            }
          } else if (event.type === 1) {
            if (event.total && event.total > 0) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            }
          }
        },
        error: (err) => {
          console.error('Error subiendo la imagen a Cloudinary:', err);
          this.uploadProgress = 0;
          
          if (err.status === 0) {
            reject('Error de conexión al subir la imagen. Verifique su conexión a internet.');
          } else if (err.status === 413) {
            reject('La imagen es demasiado grande. Reduzca el tamaño del archivo.');
          } else if (err.error && err.error.message) {
            reject(`Error al subir imagen: ${err.error.message}`);
          } else {
            reject('Error al subir la imagen. Por favor, intente de nuevo.');
          }
        }
      });
    });
  }
  
  // Método para limpiar mensajes de error
  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
    this.fieldErrors = {};
  }

  // Método para manejar errores del servidor
  handleServerError(err: any): void {
    this.clearMessages();
    
    if (err.error) {
      // Error específico del servidor con campo
      if (err.error.field && err.error.message) {
        this.fieldErrors[err.error.field] = err.error.message;
        this.error = err.error.message;
      }
      // Errores de validación múltiples
      else if (err.error.errors && Array.isArray(err.error.errors)) {
        err.error.errors.forEach((error: any) => {
          if (error.field && error.message) {
            this.fieldErrors[error.field] = error.message;
          }
        });
        this.error = 'Por favor corrija los errores en el formulario';
      }
      // Error genérico del servidor
      else if (err.error.message) {
        this.error = err.error.message;
      }
      else {
        this.error = 'Error del servidor. Por favor, intente de nuevo.';
      }
    }
    // Error de red o conexión
    else if (err.status === 0) {
      this.error = 'Error de conexión. Verifique su conexión a internet.';
    }
    // Error genérico
    else {
      this.error = 'Error inesperado. Por favor, intente de nuevo.';
    }
  }

  // Sobrescribimos el método onSubmit para manejar la carga de imágenes
  onSubmit(): void {
    this.clearMessages();
    
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }
    
    // Validar si el precio es 0
    const price = Number(this.productForm.get('price')?.value);
    if (price === 0) {
      if (!confirm('⚠️ ADVERTENCIA: El precio del producto es $0 (GRATIS).\n\n¿Está seguro de que desea crear/actualizar este producto con precio $0?\n\nEsto significa que el producto será gratis para los clientes.')) {
        return;
      }
    }
    
    this.isUploading = true;
    
    // Primero subimos la imagen si hay alguna
    this.uploadImage().then(imageUrl => {
      const formValue = this.productForm.value;
      
      // Preparar los datos del producto con transformaciones necesarias
      const productData: Product = {
        // Campos básicos
        name: formValue.name?.trim(),
        description: formValue.description?.trim(),
        price: Number(formValue.price),
        imageUrl: imageUrl,
        category: formValue.category,
        stock: Number(formValue.stock) || 0,
        
        // Campos técnicos
        productType: formValue.productType?.trim() || undefined,
        cut: formValue.cut || undefined,
        sizesText: formValue.sizesText?.trim() || undefined,
        mainColor: formValue.mainColor?.trim() || undefined,
        material: formValue.material?.trim() || undefined,
        priceRange: formValue.priceRange || undefined,
        occasion: formValue.occasion || undefined,
        
        // Campos de marketing
        featured: Boolean(formValue.featured),
        isPopular: Boolean(formValue.isPopular),
        isExclusive: Boolean(formValue.isExclusive),
        
        // Medidas (convertir a objeto si hay datos)
        measurements: (formValue.measurementLength || formValue.measurementShoulders || formValue.measurementWaist) ? {
          length: formValue.measurementLength?.trim() || undefined,
          shoulders: formValue.measurementShoulders?.trim() || undefined,
          waist: formValue.measurementWaist?.trim() || undefined
        } : undefined,
        
        // Arrays (convertir strings separados por comas a arrays)
        colors: formValue.colorsArray ? 
          formValue.colorsArray.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : 
          undefined,
        eventTypes: formValue.eventTypesArray ? 
          formValue.eventTypesArray.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : 
          undefined,
        includes: formValue.includesArray ? 
          formValue.includesArray.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : 
          undefined
      };

      if (this.editMode && this.currentProductId) {
        this.apiService.updateProduct(this.currentProductId, productData).subscribe({
          next: (response) => {
            this.isUploading = false;
            this.successMessage = 'Producto actualizado exitosamente';
            this.resetForm();
            this.loadProducts();
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Error actualizando producto:', err);
            this.handleServerError(err);
          }
        });
      } else {
        this.apiService.createProduct(productData).subscribe({
          next: (response) => {
            this.isUploading = false;
            this.successMessage = 'Producto creado exitosamente';
            this.resetForm();
            this.loadProducts();
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Error creando producto:', err);
            this.handleServerError(err);
          }
        });
      }
    }).catch(err => {
      this.isUploading = false;
      console.error('Error subiendo imagen:', err);
      this.error = 'Error al subir la imagen. Verifique que el archivo sea una imagen válida y no supere 5MB.';
    });
  }
}
