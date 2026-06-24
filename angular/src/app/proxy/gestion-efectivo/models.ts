export enum TipoMovimientoEfectivo {
  Venta = 1,
  PagoPremio = 2,
  EntregaFondosAdmin = 3,
  EntregaFondosTerminal = 4,
  AjusteComision = 5,
  AnulacionVenta = 6,
}

export const TipoMovimientoLabels: Record<number, string> = {
  [TipoMovimientoEfectivo.Venta]: 'Venta',
  [TipoMovimientoEfectivo.PagoPremio]: 'Pago Premio',
  [TipoMovimientoEfectivo.EntregaFondosAdmin]: 'Fondos de Admin',
  [TipoMovimientoEfectivo.EntregaFondosTerminal]: 'Entrega a Admin',
  [TipoMovimientoEfectivo.AjusteComision]: 'Comisiones',
  [TipoMovimientoEfectivo.AnulacionVenta]: 'Anulación',
};

export const TiposPositivos = [
  TipoMovimientoEfectivo.Venta,
  TipoMovimientoEfectivo.EntregaFondosAdmin,
];

export interface MovimientoEfectivoDto {
  id: string;
  terminalId: string;
  nombreTerminal: string;
  tipo: TipoMovimientoEfectivo;
  tipoLabel?: string;
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  referenciaId?: string;
  notas?: string;
  registradoPor: string;
  fechaMovimiento: string;
}

export interface RegistrarTransferenciaDto {
  terminalId: string;
  monto: number;
  notas?: string;
}

export interface ResumenEfectivoTerminalDto {
  terminalId: string;
  nombre: string;
  nombreVendedor: string;
  saldoEfectivo: number;
  estaEnVerde: boolean;
}

export interface PreviewLiquidacionDto {
  saldoEfectivo: number;
  ventasBrutas: number;
  totalPremiosPagados: number;
  porcentajeComisionVenta: number;
  montoComisionVenta: number;
  porcentajeComisionVerde: number;
  montoComisionVerde: number;
  totalComisiones: number;
  montoSugeridoEntrega: number;
}
