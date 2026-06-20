import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';

export interface DashboardDto {
  ventasHoy: number;
  premiosPagadosHoy: number;
  ticketsHoy: number;
  terminalesActivas: number;
  ventasPorTerminal: VentaPorTerminalDto[];
  ultimosResultados: ResultadoRecienteDto[];
  numerosMasVendidos: NumeroMasVendidoDto[];
}

export interface VentaPorTerminalDto {
  nombreTerminal: string;
  nombreVendedor: string;
  montoVendido: number;
  cantidadTickets: number;
}

export interface ResultadoRecienteDto {
  nombreLoteria: string;
  nombreSorteo: string;
  fecha: string;
  primera: number;
  segunda: number;
  tercera: number;
}

export interface NumeroMasVendidoDto {
  numero: number;
  montoTotal: number;
  cantidadJugadas: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  apiName = 'Default';

  obtenerDashboard = () =>
    this.restService.request<any, DashboardDto>({ method: 'POST', url: '/api/app/dashboard/obtener-dashboard' }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
