import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';

export interface ExcedentesAguanteParametrosDto {
  loteriaId?: string;
  sorteoId?: string;
  fecha: string;
}

export interface ExcedentesAguanteItemDto {
  nombreLoteria: string;
  nombreSorteo: string;
  numero: number;
  limiteVentaMaximo: number;
  limiteAguante: number;
  montoVendido: number;
  excedenteAguante: number;
  disponible: number;
  porcentajeUso: number;
}

export interface ExcedentesAguanteReporteDto {
  fecha: string;
  filtroLoteria: string;
  filtroSorteo: string;
  items: ExcedentesAguanteItemDto[];
  totalExcedente: number;
  cantidadNumeros: number;
}

@Injectable({ providedIn: 'root' })
export class ExcedentesAguanteService {
  apiName = 'Default';

  generar = (input: ExcedentesAguanteParametrosDto) =>
    this.restService.request<any, ExcedentesAguanteReporteDto>({
      method: 'POST',
      url: '/api/app/excedentes-aguante/generar',
      body: input
    }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
