import { Routes } from '@angular/router';

export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tenant-list.component').then(c => c.TenantListComponent),
    data: { breadcrumb: 'Gestión de Bancas' }
  }
];
