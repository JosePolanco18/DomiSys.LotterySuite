import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.IdentityModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('./identity/identity.routes').then(m => m.IDENTITY_ROUTES),
    data: { breadcrumb: 'Identidad' }
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
  },
  {
    path: 'loterias',
    data: { breadcrumb: 'Loterías' },
    loadChildren: () => import('./loterias/loterias.routes').then(m => m.LOTERIAS_ROUTES)
  },
  {
    path: 'terminales',
    data: { breadcrumb: 'Terminales' },
    loadChildren: () => import('./terminales/terminales.routes').then(m => m.TERMINALES_ROUTES)
  },
  {
    path: 'ventas',
    data: { breadcrumb: 'Ventas' },
    loadChildren: () => import('./ventas/ventas.routes').then(m => m.VENTAS_ROUTES)
  },
  {
    path: 'cuadres',
    data: { breadcrumb: 'Cuadres' },
    loadChildren: () => import('./cuadres/cuadres.routes').then(m => m.CUADRES_ROUTES)
  },
  {
    path: 'control-riesgo',
    data: { breadcrumb: 'Control de Riesgo' },
    loadChildren: () => import('./control-riesgo/control-riesgo.routes').then(m => m.CONTROL_RIESGO_ROUTES)
  },
  {
    path: 'configuracion',
    data: { breadcrumb: 'Configuracion' },
    loadComponent: () => import('./configuracion/configuracion-general.component').then(c => c.ConfiguracionGeneralComponent)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
