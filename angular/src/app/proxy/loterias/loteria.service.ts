import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import type { LoteriaDto, CrearActualizarLoteriaDto, SorteoDto, CrearActualizarSorteoDto, ResultadoSorteoDto, CrearResultadoSorteoDto, ConfiguracionPagoDto, CrearActualizarConfiguracionPagoDto, ConfiguracionPagoSorteoDto, CrearActualizarConfiguracionPagoSorteoDto, ConfiguracionMontoJugadaDto, CrearActualizarConfiguracionMontoJugadaDto } from './models';

@Injectable({ providedIn: 'root' })
export class LoteriaService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<LoteriaDto>>({ method: 'GET', url: '/api/app/loteria', params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, LoteriaDto>({ method: 'GET', url: `/api/app/loteria/${id}` }, { apiName: this.apiName });

  getConSorteos = (id: string) =>
    this.restService.request<any, LoteriaDto>({ method: 'POST', url: `/api/app/loteria/${id}/obtener-con-sorteos`, body: {} }, { apiName: this.apiName });

  getActivas = () =>
    this.restService.request<any, LoteriaDto[]>({ method: 'POST', url: '/api/app/loteria/obtener-activas', body: {} }, { apiName: this.apiName });

  create = (input: CrearActualizarLoteriaDto) =>
    this.restService.request<any, LoteriaDto>({ method: 'POST', url: '/api/app/loteria', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarLoteriaDto) =>
    this.restService.request<any, LoteriaDto>({ method: 'PUT', url: `/api/app/loteria/${id}`, body: input }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({ method: 'DELETE', url: `/api/app/loteria/${id}` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}

@Injectable({ providedIn: 'root' })
export class SorteoService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<SorteoDto>>({ method: 'GET', url: '/api/app/sorteo', params: input }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, SorteoDto>({ method: 'GET', url: `/api/app/sorteo/${id}` }, { apiName: this.apiName });

  getPorLoteria = (loteriaId: string) =>
    this.restService.request<any, SorteoDto[]>({ method: 'POST', url: `/api/app/sorteo/obtener-por-loteria/${loteriaId}`, body: {} }, { apiName: this.apiName });

  getAbiertos = () =>
    this.restService.request<any, SorteoDto[]>({ method: 'POST', url: '/api/app/sorteo/obtener-abiertos', body: {} }, { apiName: this.apiName });

  create = (input: CrearActualizarSorteoDto) =>
    this.restService.request<any, SorteoDto>({ method: 'POST', url: '/api/app/sorteo', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarSorteoDto) =>
    this.restService.request<any, SorteoDto>({ method: 'PUT', url: `/api/app/sorteo/${id}`, body: input }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({ method: 'DELETE', url: `/api/app/sorteo/${id}` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}

@Injectable({ providedIn: 'root' })
export class ResultadoSorteoService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<ResultadoSorteoDto>>({ method: 'POST', url: '/api/app/resultado-sorteo/obtener-lista', body: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount } }, { apiName: this.apiName });

  getPorFecha = (fecha: string) =>
    this.restService.request<any, ResultadoSorteoDto[]>({ method: 'POST', url: '/api/app/resultado-sorteo/obtener-por-fecha', body: {}, params: { fecha } }, { apiName: this.apiName });

  getUltimos = (cantidad: number = 10) =>
    this.restService.request<any, ResultadoSorteoDto[]>({ method: 'POST', url: '/api/app/resultado-sorteo/obtener-ultimos', body: {}, params: { cantidad } }, { apiName: this.apiName });

  registrar = (input: CrearResultadoSorteoDto) =>
    this.restService.request<any, ResultadoSorteoDto>({ method: 'POST', url: '/api/app/resultado-sorteo/registrar', body: input }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionPagoService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<ConfiguracionPagoDto>>({ method: 'GET', url: '/api/app/configuracion-pago', params: input }, { apiName: this.apiName });

  getPorLoteria = (loteriaId: string) =>
    this.restService.request<any, ConfiguracionPagoDto[]>({ method: 'POST', url: `/api/app/configuracion-pago/obtener-por-loteria/${loteriaId}`, body: {} }, { apiName: this.apiName });

  create = (input: CrearActualizarConfiguracionPagoDto) =>
    this.restService.request<any, ConfiguracionPagoDto>({ method: 'POST', url: '/api/app/configuracion-pago', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarConfiguracionPagoDto) =>
    this.restService.request<any, ConfiguracionPagoDto>({ method: 'PUT', url: `/api/app/configuracion-pago/${id}`, body: input }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({ method: 'DELETE', url: `/api/app/configuracion-pago/${id}` }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionPagoSorteoService {
  apiName = 'Default';

  getPorSorteo = (sorteoId: string) =>
    this.restService.request<any, ConfiguracionPagoSorteoDto>({ method: 'POST', url: `/api/app/configuracion-pago-sorteo/obtener-por-sorteo/${sorteoId}`, body: {} }, { apiName: this.apiName });

  actualizar = (sorteoId: string, input: CrearActualizarConfiguracionPagoSorteoDto) =>
    this.restService.request<any, ConfiguracionPagoSorteoDto>({ method: 'POST', url: `/api/app/configuracion-pago-sorteo/actualizar/${sorteoId}`, body: input }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionMontoJugadaService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<ConfiguracionMontoJugadaDto>>({ method: 'GET', url: '/api/app/configuracion-monto-jugada', params: input }, { apiName: this.apiName });

  create = (input: CrearActualizarConfiguracionMontoJugadaDto) =>
    this.restService.request<any, ConfiguracionMontoJugadaDto>({ method: 'POST', url: '/api/app/configuracion-monto-jugada', body: input }, { apiName: this.apiName });

  update = (id: string, input: CrearActualizarConfiguracionMontoJugadaDto) =>
    this.restService.request<any, ConfiguracionMontoJugadaDto>({ method: 'PUT', url: `/api/app/configuracion-monto-jugada/${id}`, body: input }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
