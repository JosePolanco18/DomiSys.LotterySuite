import type { AuditedEntityDto } from '@abp/ng.core';

export interface CuadreTerminalDto extends AuditedEntityDto<string> {
  terminalId?: string;
  nombreTerminal?: string;
  nombreVendedor?: string;
  fechaCuadre?: string;
  periodoInicio?: string;
  periodoFin?: string;
  ventasBrutas: number;
  totalPremiosPagados: number;
  porcentajeComisionVenta: number;
  montoComisionVenta: number;
  porcentajeComisionVerde: number;
  montoComisionVerde: number;
  balanceNeto: number;
  quedoEnVerde: boolean;
  notas?: string;
  cuadradoPor?: string;
}

export interface GenerarCuadreDto {
  terminalId: string;
  notas?: string;
}
