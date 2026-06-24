import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import type { MovimientoEfectivoDto, PreviewLiquidacionDto, RegistrarTransferenciaDto, ResumenEfectivoTerminalDto } from './models';

@Injectable({ providedIn: 'root' })
export class GestionEfectivoService {
  apiName = 'Default';

  getResumenTerminales = () =>
    this.restService.request<any, ResumenEfectivoTerminalDto[]>({ method: 'GET', url: '/api/app/gestion-efectivo/resumen-todas-terminales' }, { apiName: this.apiName });

  registrarEntregaAdmin = (input: RegistrarTransferenciaDto) =>
    this.restService.request<any, MovimientoEfectivoDto>({ method: 'POST', url: '/api/app/gestion-efectivo/registrar-entrega-admin', body: input }, { apiName: this.apiName });

  registrarEntregaTerminal = (input: RegistrarTransferenciaDto) =>
    this.restService.request<any, MovimientoEfectivoDto>({ method: 'POST', url: '/api/app/gestion-efectivo/registrar-entrega-terminal', body: input }, { apiName: this.apiName });

  getMovimientos = (terminalId: string, input: any) =>
    this.restService.request<any, PagedResultDto<MovimientoEfectivoDto>>({ method: 'GET', url: `/api/app/gestion-efectivo/${terminalId}/movimientos`, params: { skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  getPreviewLiquidacion = (terminalId: string) =>
    this.restService.request<any, PreviewLiquidacionDto>({ method: 'GET', url: `/api/app/gestion-efectivo/${terminalId}/preview-liquidacion` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
