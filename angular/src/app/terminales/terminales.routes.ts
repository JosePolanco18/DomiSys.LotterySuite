import { Routes } from '@angular/router';

export const TERMINALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./terminal-lista/terminal-list.component').then(c => c.TerminalListComponent),
    data: { breadcrumb: 'Terminales' }
  },
  {
    path: 'nueva',
    loadComponent: () => import('./terminal-formulario/terminal-form.component').then(c => c.TerminalFormComponent),
    data: { breadcrumb: 'Nueva Terminal' }
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./terminal-formulario/terminal-form.component').then(c => c.TerminalFormComponent),
    data: { breadcrumb: 'Editar Terminal' }
  }
];
