import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import type { TicketDto, CrearTicketAdminDto, AnularTicketDto } from './models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  apiName = 'Default';

  procesarVentaAdmin = (input: CrearTicketAdminDto) =>
    this.restService.request<any, TicketDto>({ method: 'POST', url: '/api/app/ticket/procesar-venta-admin', body: input }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, TicketDto>({ method: 'POST', url: `/api/app/ticket/${id}/obtener`, body: {} }, { apiName: this.apiName });

  getPorCodigo = (codigo: string) =>
    this.restService.request<any, TicketDto>({ method: 'POST', url: '/api/app/ticket/obtener-por-codigo', body: {}, params: { codigoTicket: codigo } }, { apiName: this.apiName });

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<TicketDto>>({ method: 'GET', url: '/api/app/ticket', params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  getPorTerminal = (terminalId: string, input: any) =>
    this.restService.request<any, PagedResultDto<TicketDto>>({ method: 'POST', url: `/api/app/ticket/obtener-por-terminal/${terminalId}`, body: {}, params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  anular = (id: string, input: AnularTicketDto) =>
    this.restService.request<any, TicketDto>({ method: 'POST', url: `/api/app/ticket/${id}/anular-ticket`, body: input }, { apiName: this.apiName });

  pagarGanador = (id: string) =>
    this.restService.request<any, TicketDto>({ method: 'POST', url: `/api/app/ticket/${id}/pagar-ganador`, body: {} }, { apiName: this.apiName });

  getGanadores = () =>
    this.restService.request<any, TicketDto[]>({ method: 'POST', url: '/api/app/ticket/obtener-ganadores', body: {} }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
