import { Routes } from '@angular/router';

export const CUADRES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cuadre-lista/cuadre-list.component').then(c => c.CuadreListComponent),
    data: { breadcrumb: 'Cuadres' }
  },
  {
    path: 'generar',
    loadComponent: () => import('./cuadre-formulario/cuadre-form.component').then(c => c.CuadreFormComponent),
    data: { breadcrumb: 'Generar Cuadre' }
  }
];
