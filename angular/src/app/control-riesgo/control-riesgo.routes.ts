import { Routes } from '@angular/router';

export const CONTROL_RIESGO_ROUTES: Routes = [
  {
    path: 'limites',
    loadComponent: () => import('./limites-numeros/limite-numero-list.component').then(c => c.LimiteNumeroListComponent),
    data: { breadcrumb: 'Límites por Número' }
  },
  {
    path: 'limites/nuevo',
    loadComponent: () => import('./limites-numeros/limite-numero-form.component').then(c => c.LimiteNumeroFormComponent),
    data: { breadcrumb: 'Nuevo Límite' }
  },
  {
    path: 'limites/editar/:id',
    loadComponent: () => import('./limites-numeros/limite-numero-form.component').then(c => c.LimiteNumeroFormComponent),
    data: { breadcrumb: 'Editar Límite' }
  },
  {
    path: 'monitor',
    loadComponent: () => import('./monitor-limites/monitor-limites.component').then(c => c.MonitorLimitesComponent),
    data: { breadcrumb: 'Monitor de Ventas' }
  }
];
