
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminProductsComponent } from './components/admin/admin-products/admin-products.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogComponent },
  { 
    path: 'admin', 
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent },
      { 
        path: 'productos', 
        component: AdminProductsComponent,
        canActivate: [authGuard]  // Protege esta ruta con el guard
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
