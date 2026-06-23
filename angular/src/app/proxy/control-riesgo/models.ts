import type { AuditedEntityDto } from '@abp/ng.core';

export interface LimiteNumeroDto extends AuditedEntityDto<string> {
  loteriaId?: string;
  nombreLoteria?: string;
  sorteoId?: string;
  nombreSorteo?: string;
  numero: number;
  limiteVentaMaximo: number;
  limiteAguante: number;
  bloqueado: boolean;
  notas?: string;
  montoVendido: number;
  disponible: number;
  excedenteAguante: number;
}

export interface CrearActualizarLimiteNumeroDto {
  loteriaId: string;
  sorteoId: string;
  numero: number;
  limiteVentaMaximo: number;
  limiteAguante: number;
  bloqueado: boolean;
  notas?: string;
}

export interface AplicarLimitesMasivosDto {
  loteriaId?: string;
  sorteoId?: string;
  limiteVentaMaximo: number;
  limiteAguante: number;
}

export interface ResultadoLimitesMasivosDto {
  creados: number;
  actualizados: number;
  total: number;
}

export interface AcumuladoVentaNumeroDto {
  sorteoId?: string;
  nombreSorteo?: string;
  nombreLoteria?: string;
  fecha?: string;
  numero: number;
  montoAcumulado: number;
  limiteVentaMaximo: number;
  limiteAguante: number;
  disponible: number;
  excedenteAguante: number;
}
