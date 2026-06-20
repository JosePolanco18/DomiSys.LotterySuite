import { Routes } from '@angular/router';

export const LOTERIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./loteria-lista/loteria-list.component').then(c => c.LoteriaListComponent),
    data: { breadcrumb: 'Loterías' }
  },
  {
    path: 'nueva',
    loadComponent: () => import('./loteria-formulario/loteria-form.component').then(c => c.LoteriaFormComponent),
    data: { breadcrumb: 'Nueva Lotería' }
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./loteria-formulario/loteria-form.component').then(c => c.LoteriaFormComponent),
    data: { breadcrumb: 'Editar Lotería' }
  },
  {
    path: 'resultados',
    loadComponent: () => import('./resultados-sorteo/lista/resultado-sorteo-list.component').then(c => c.ResultadoSorteoListComponent),
    data: { breadcrumb: 'Resultados' }
  },
  {
    path: 'resultados/registrar',
    loadComponent: () => import('./resultados-sorteo/formulario/resultado-sorteo-form.component').then(c => c.ResultadoSorteoFormComponent),
    data: { breadcrumb: 'Registrar Resultado' }
  }
];
