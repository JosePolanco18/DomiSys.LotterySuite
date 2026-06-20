import { Routes } from '@angular/router';
import { UserFormComponent } from './users/form/user-form.component';
import { RoleFormComponent } from './roles/form/role-form.component';

/**
 * Rutas adicionales para Identity (formularios personalizados)
 * Las listas de usuarios y roles se manejan a través del módulo ABP con component replacement
 */
export const IDENTITY_ROUTES: Routes = [
  // Rutas para usuarios
  {
    path: 'users/new',
    component: UserFormComponent,
    data: { breadcrumb: 'Nuevo Usuario' }
  },
  {
    path: 'users/edit/:id',
    component: UserFormComponent,
    data: { breadcrumb: 'Editar Usuario' }
  },

  // Rutas para roles
  {
    path: 'roles/new',
    component: RoleFormComponent,
    data: { breadcrumb: 'Nuevo Rol' }
  },
  {
    path: 'roles/edit/:id',
    component: RoleFormComponent,
    data: { breadcrumb: 'Editar Rol' }
  }
];
