import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import type { TerminalDto, CrearActualizarTerminalDto } from './models';

@Injectable({ providedIn: 'root' })
export class TerminalService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<TerminalDto>>({ method: 'GET', url: '/api/app/terminal', params: input }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, TerminalDto>({ method: 'GET', url: `/api/app/terminal/${id}` }, { apiName: this.apiName });

  create = (input: CrearActualizarTerminalDto) =>
    this.restService.request<any, TerminalDto>({ method: 'POST', url: '/api/app/terminal', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarTerminalDto) =>
    this.restService.request<any, TerminalDto>({ method: 'PUT', url: `/api/app/terminal/${id}`, body: input }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({ method: 'DELETE', url: `/api/app/terminal/${id}` }, { apiName: this.apiName });

  activar = (id: string) =>
    this.restService.request<any, TerminalDto>({ method: 'POST', url: `/api/app/terminal/${id}/activar` }, { apiName: this.apiName });

  suspender = (id: string) =>
    this.restService.request<any, TerminalDto>({ method: 'POST', url: `/api/app/terminal/${id}/suspender` }, { apiName: this.apiName });

  bloquear = (id: string) =>
    this.restService.request<any, TerminalDto>({ method: 'POST', url: `/api/app/terminal/${id}/bloquear` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
