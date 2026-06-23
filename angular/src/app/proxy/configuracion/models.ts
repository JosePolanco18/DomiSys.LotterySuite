export interface ConfiguracionGeneralDto {
  comisionVentaPorDefecto: number;
  comisionVerdePorDefecto: number;
  minutosVentanaAnulacion: number;
  vendedorPuedeAnular: boolean;
  nombreEmpresa: string;
  telefonoEmpresa?: string;
  pieTicket?: string;
}
