import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import type { CuadreTerminalDto, GenerarCuadreDto } from './models';

@Injectable({ providedIn: 'root' })
export class CuadreService {
  apiName = 'Default';

  generar = (input: GenerarCuadreDto) =>
    this.restService.request<any, CuadreTerminalDto>({ method: 'POST', url: '/api/app/cuadre/generar-cuadre', body: input }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, CuadreTerminalDto>({ method: 'POST', url: `/api/app/cuadre/${id}/obtener`, body: {} }, { apiName: this.apiName });

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<CuadreTerminalDto>>({ method: 'GET', url: '/api/app/cuadre', params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  getPorTerminal = (terminalId: string, input: any) =>
    this.restService.request<any, PagedResultDto<CuadreTerminalDto>>({ method: 'POST', url: `/api/app/cuadre/obtener-por-terminal/${terminalId}`, body: {}, params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  getResumenTerminal = (terminalId: string) =>
    this.restService.request<any, CuadreTerminalDto>({ method: 'POST', url: `/api/app/cuadre/obtener-resumen-terminal/${terminalId}`, body: {} }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
