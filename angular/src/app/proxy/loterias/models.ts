import type { AuditedEntityDto } from '@abp/ng.core';

export interface LoteriaDto extends AuditedEntityDto<string> {
  nombre?: string;
  codigoCorto?: string;
  logoUrl?: string;
  activa: boolean;
  orden: number;
  sorteos?: SorteoDto[];
  configuracionesPago?: ConfiguracionPagoDto[];
}

export interface CrearActualizarLoteriaDto {
  nombre: string;
  codigoCorto: string;
  logoUrl?: string;
  activa: boolean;
  orden: number;
}

export interface SorteoDto extends AuditedEntityDto<string> {
  loteriaId?: string;
  nombreLoteria?: string;
  nombre?: string;
  diasActivos?: string;
  horaAperturaVentas?: string;
  horaCierreVentas?: string;
  horaSorteo?: string;
  minutosEsperaScraping: number;
  activo: boolean;
  estaAbierto: boolean;
}

export interface CrearActualizarSorteoDto {
  loteriaId: string;
  nombre: string;
  diasActivos: string;
  horaAperturaVentas: string;
  horaCierreVentas: string;
  horaSorteo: string;
  minutosEsperaScraping: number;
  activo: boolean;
}

export interface ResultadoSorteoDto extends AuditedEntityDto<string> {
  sorteoId?: string;
  nombreSorteo?: string;
  nombreLoteria?: string;
  fecha?: string;
  primera: number;
  segunda: number;
  tercera: number;
  fuente: number;
  verificado: boolean;
  fechaRegistro?: string;
  registradoPor?: string;
}

export interface CrearResultadoSorteoDto {
  sorteoId: string;
  fecha: string;
  primera: number;
  segunda: number;
  tercera: number;
}

export interface ConfiguracionPagoDto extends AuditedEntityDto<string> {
  loteriaId?: string;
  nombreLoteria?: string;
  tipoJugada: number;
  multiplicadorPago: number;
  activo: boolean;
}

export interface CrearActualizarConfiguracionPagoDto {
  loteriaId: string;
  tipoJugada: number;
  multiplicadorPago: number;
  activo: boolean;
}

export interface ConfiguracionPagoSorteoDto extends AuditedEntityDto<string> {
  sorteoId?: string;
  nombreSorteo?: string;
  nombreLoteria?: string;
  quinielaPrimera: number;
  quinielaSegunda: number;
  quinielaTercera: number;
  palePrimeraSegunda: number;
  paleSegundaTercera: number;
  tripleta: number;
  superPale: number;
}

export interface CrearActualizarConfiguracionPagoSorteoDto {
  sorteoId: string;
  quinielaPrimera: number;
  quinielaSegunda: number;
  quinielaTercera: number;
  palePrimeraSegunda: number;
  paleSegundaTercera: number;
  tripleta: number;
  superPale: number;
}

export interface ConfiguracionMontoJugadaDto extends AuditedEntityDto<string> {
  tipoJugada: number;
  montoMinimo: number;
  montoMaximo: number;
}

export interface CrearActualizarConfiguracionMontoJugadaDto {
  tipoJugada: number;
  montoMinimo: number;
  montoMaximo: number;
}
