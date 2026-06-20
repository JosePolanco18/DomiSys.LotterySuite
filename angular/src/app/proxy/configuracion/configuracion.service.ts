import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { ConfiguracionGeneralDto } from './models';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  apiName = 'Default';

  obtener = () =>
    this.restService.request<any, ConfiguracionGeneralDto>({ method: 'POST', url: '/api/app/configuracion/obtener', body: {} }, { apiName: this.apiName });

  actualizar = (input: ConfiguracionGeneralDto) =>
    this.restService.request<any, ConfiguracionGeneralDto>({ method: 'POST', url: '/api/app/configuracion/actualizar', body: input }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
