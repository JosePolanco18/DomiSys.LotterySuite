import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';

export interface ResultadoScrapedDto {
  loteria: string;
  primera: number;
  segunda: number;
  tercera: number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ResultadosGeneralesService {
  apiName = 'Default';

  obtenerTodos = () =>
    this.restService.request<any, ResultadoScrapedDto[]>({ method: 'POST', url: '/api/app/resultados-generales/obtener-todos-resultados' }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
