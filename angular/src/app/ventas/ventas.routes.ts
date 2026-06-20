import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: 'punto-de-venta',
    loadComponent: () => import('./punto-de-venta/punto-de-venta.component').then(c => c.PuntoDeVentaComponent),
    data: { breadcrumb: 'Punto de Venta' }
  },
  {
    path: 'tickets',
    loadComponent: () => import('./ticket-lista/ticket-list.component').then(c => c.TicketListComponent),
    data: { breadcrumb: 'Tickets' }
  },
  {
    path: 'tickets/:id',
    loadComponent: () => import('./ticket-detalle/ticket-detalle.component').then(c => c.TicketDetalleComponent),
    data: { breadcrumb: 'Detalle Ticket' }
  },
  {
    path: 'ganadores',
    loadComponent: () => import('./tickets-ganadores/tickets-ganadores.component').then(c => c.TicketsGanadoresComponent),
    data: { breadcrumb: 'Tickets Ganadores' }
  }
];
