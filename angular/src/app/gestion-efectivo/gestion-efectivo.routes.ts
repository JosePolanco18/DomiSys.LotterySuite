import { Routes } from '@angular/router';

export const GESTION_EFECTIVO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./gestion-efectivo-dashboard.component').then(c => c.GestionEfectivoDashboardComponent),
    data: { breadcrumb: 'Gestión de Efectivo' }
  },
  {
    path: 'terminal/:terminalId',
    loadComponent: () => import('./gestion-efectivo-movimientos.component').then(c => c.GestionEfectivoMovimientosComponent),
    data: { breadcrumb: 'Movimientos' }
  }
];
