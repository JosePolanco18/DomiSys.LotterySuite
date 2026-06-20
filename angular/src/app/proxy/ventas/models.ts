import type { AuditedEntityDto } from '@abp/ng.core';

export interface TicketDto extends AuditedEntityDto<string> {
  codigoTicket?: string;
  terminalId?: string;
  nombreTerminal?: string;
  nombreVendedor?: string;
  fechaCreacion?: string;
  estado: number;
  montoTotal: number;
  totalPremios: number;
  fechaPago?: string;
  fechaAnulacion?: string;
  anuladoPor?: string;
  motivoAnulacion?: string;
  detalles?: DetalleTicketDto[];
}

export interface DetalleTicketDto {
  id?: string;
  sorteoId?: string;
  nombreSorteo?: string;
  nombreLoteria?: string;
  fechaSorteo?: string;
  tipoJugada: number;
  primerNumero: number;
  segundoNumero?: number;
  tercerNumero?: number;
  segundoSorteoId?: string;
  nombreSegundoSorteo?: string;
  monto: number;
  multiplicadorPago: number;
  montoPremio: number;
  esGanador: boolean;
}

export interface CrearTicketAdminDto {
  terminalId: string;
  detalles: CrearDetalleTicketDto[];
}

export interface CrearDetalleTicketDto {
  sorteoId: string;
  tipoJugada: number;
  primerNumero: number;
  segundoNumero?: number;
  tercerNumero?: number;
  segundoSorteoId?: string;
  monto: number;
}

export interface AnularTicketDto {
  motivoAnulacion?: string;
}
