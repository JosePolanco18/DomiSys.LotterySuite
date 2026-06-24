import { RoutesService, eLayoutType } from '@abp/ng.core';
import { inject, provideAppInitializer } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  provideAppInitializer(() => {
    configureRoutes();
  }),
];

function configureRoutes() {
  const routes = inject(RoutesService);
  routes.add([
    {
      path: '/',
      name: '::Dashboard',
      iconClass: 'fas fa-tachometer-alt',
      order: 1,
      layout: eLayoutType.application,
    },

    // ========== LOTERÍAS ==========
    {
      name: '::Loterías',
      iconClass: 'fas fa-dice',
      order: 10,
      layout: eLayoutType.application,
    },
    {
      path: '/loterias',
      name: '::Gestión de Loterías',
      parentName: '::Loterías',
      iconClass: 'fas fa-cogs',
      order: 11,
      layout: eLayoutType.application,
    },
    {
      path: '/loterias/resultados',
      name: '::Resultados',
      parentName: '::Loterías',
      iconClass: 'fas fa-poll',
      order: 12,
      layout: eLayoutType.application,
    },

    // ========== TERMINALES ==========
    {
      path: '/terminales',
      name: '::Terminales',
      iconClass: 'fas fa-tablet-alt',
      order: 20,
      layout: eLayoutType.application,
    },

    // ========== VENTAS ==========
    {
      name: '::Ventas',
      iconClass: 'fas fa-receipt',
      order: 30,
      layout: eLayoutType.application,
    },
    {
      path: '/ventas/punto-de-venta',
      name: '::Punto de Venta',
      parentName: '::Ventas',
      iconClass: 'fas fa-cash-register',
      order: 31,
      layout: eLayoutType.application,
    },
    {
      path: '/ventas/tickets',
      name: '::Tickets',
      parentName: '::Ventas',
      iconClass: 'fas fa-ticket-alt',
      order: 32,
      layout: eLayoutType.application,
    },
    {
      path: '/ventas/ganadores',
      name: '::Ganadores',
      parentName: '::Ventas',
      iconClass: 'fas fa-trophy',
      order: 33,
      layout: eLayoutType.application,
    },

    // ========== CUADRES ==========
    {
      path: '/cuadres',
      name: '::Cuadres',
      iconClass: 'fas fa-calculator',
      order: 40,
      layout: eLayoutType.application,
    },

    // ========== GESTION DE EFECTIVO ==========
    {
      path: '/gestion-efectivo',
      name: '::Gestión de Efectivo',
      iconClass: 'fas fa-money-bill-wave',
      order: 45,
      layout: eLayoutType.application,
    },

    // ========== CONTROL DE RIESGO ==========
    {
      name: '::Control de Riesgo',
      iconClass: 'fas fa-shield-alt',
      order: 50,
      layout: eLayoutType.application,
    },
    {
      path: '/control-riesgo/limites',
      name: '::Límites por Número',
      parentName: '::Control de Riesgo',
      iconClass: 'fas fa-sort-numeric-up',
      order: 51,
      layout: eLayoutType.application,
    },
    {
      path: '/control-riesgo/limites-masivos',
      name: '::Asignacion Masiva',
      parentName: '::Control de Riesgo',
      iconClass: 'fas fa-layer-group',
      order: 52,
      layout: eLayoutType.application,
    },
    {
      path: '/control-riesgo/monitor',
      name: '::Monitor de Ventas',
      parentName: '::Control de Riesgo',
      iconClass: 'fas fa-chart-line',
      order: 53,
      layout: eLayoutType.application,
    },
    {
      path: '/control-riesgo/reporte-excedentes',
      name: '::Reporte Excedentes',
      parentName: '::Control de Riesgo',
      iconClass: 'fas fa-file-alt',
      order: 54,
      layout: eLayoutType.application,
    },

    // ========== CONFIGURACION ==========
    {
      path: '/configuracion',
      name: '::Configuración',
      iconClass: 'fas fa-sliders-h',
      order: 90,
      layout: eLayoutType.application,
    },

    // ========== TENANTS (HOST ADMIN) ==========
    {
      path: '/tenants',
      name: '::Gestión de Bancas',
      iconClass: 'fas fa-building',
      order: 100,
      layout: eLayoutType.application,
      requiredPolicy: 'AbpTenantManagement.Tenants',
    },
  ]);
}
