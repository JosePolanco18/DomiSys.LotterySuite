import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import type { LimiteNumeroDto, CrearActualizarLimiteNumeroDto, AcumuladoVentaNumeroDto, AplicarLimitesMasivosDto, ResultadoLimitesMasivosDto } from './models';

@Injectable({ providedIn: 'root' })
export class LimiteNumeroService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<LimiteNumeroDto>>({ method: 'GET', url: '/api/app/limite-numero', params: input }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, LimiteNumeroDto>({ method: 'GET', url: `/api/app/limite-numero/${id}` }, { apiName: this.apiName });

  getPorSorteo = (sorteoId: string) =>
    this.restService.request<any, LimiteNumeroDto[]>({ method: 'POST', url: `/api/app/limite-numero/obtener-por-sorteo/${sorteoId}`, body: {} }, { apiName: this.apiName });

  getAcumulados = (sorteoId: string, fecha: string) =>
    this.restService.request<any, AcumuladoVentaNumeroDto[]>({ method: 'POST', url: `/api/app/limite-numero/obtener-acumulados/${sorteoId}`, params: { fecha }, body: {} }, { apiName: this.apiName });

  getExcedentesAguante = (fecha: string) =>
    this.restService.request<any, AcumuladoVentaNumeroDto[]>({ method: 'POST', url: '/api/app/limite-numero/obtener-excedentes-aguante', params: { fecha }, body: {} }, { apiName: this.apiName });

  create = (input: CrearActualizarLimiteNumeroDto) =>
    this.restService.request<any, LimiteNumeroDto>({ method: 'POST', url: '/api/app/limite-numero', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarLimiteNumeroDto) =>
    this.restService.request<any, LimiteNumeroDto>({ method: 'PUT', url: `/api/app/limite-numero/${id}`, body: input }, { apiName: this.apiName });

  asignarMasivos = (input: AplicarLimitesMasivosDto) =>
    this.restService.request<any, ResultadoLimitesMasivosDto>({ method: 'POST', url: '/api/app/limite-numero/asignar-limites-masivos', body: input }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({ method: 'DELETE', url: `/api/app/limite-numero/${id}` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
