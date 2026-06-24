import { Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';

export interface TenantDto {
  id: string;
  name: string;
}

export interface CreateUpdateTenantDto {
  name: string;
  adminEmailAddress?: string;
  adminPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  apiName = 'Default';

  getList = (input: any) =>
    this.restService.request<any, PagedResultDto<TenantDto>>({
      method: 'GET',
      url: '/api/multi-tenancy/tenants',
      params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount }
    }, { apiName: this.apiName });

  get = (id: string) =>
    this.restService.request<any, TenantDto>({
      method: 'GET', url: `/api/multi-tenancy/tenants/${id}`
    }, { apiName: this.apiName });

  create = (input: CreateUpdateTenantDto) =>
    this.restService.request<any, TenantDto>({
      method: 'POST', url: '/api/multi-tenancy/tenants', body: input
    }, { apiName: this.apiName });

  update = (id: string, input: CreateUpdateTenantDto) =>
    this.restService.request<any, TenantDto>({
      method: 'PUT', url: `/api/multi-tenancy/tenants/${id}`, body: input
    }, { apiName: this.apiName });

  delete = (id: string) =>
    this.restService.request<any, void>({
      method: 'DELETE', url: `/api/multi-tenancy/tenants/${id}`
    }, { apiName: this.apiName });

  constructor(private restService: RestService) {}
}
