import type { AuditedEntityDto } from '@abp/ng.core';

export interface TerminalDto extends AuditedEntityDto<string> {
  codigo?: string;
  nombre?: string;
  nombreVendedor?: string;
  estado: number;
  porcentajeComisionVenta?: number;
  porcentajeComisionVerde?: number;
  ubicacion?: string;
  telefono?: string;
  notas?: string;
  ultimaActividad?: string;
  limiteVentaDiaria?: number;
  limiteCuadre?: number;
  puedePagarGanadores: boolean;
}

export interface CrearActualizarTerminalDto {
  codigo: string;
  nombre: string;
  nombreVendedor: string;
  pin?: string;
  porcentajeComisionVenta?: number;
  porcentajeComisionVerde?: number;
  ubicacion?: string;
  telefono?: string;
  notas?: string;
  limiteVentaDiaria?: number;
  limiteCuadre?: number;
  puedePagarGanadores: boolean;
}
