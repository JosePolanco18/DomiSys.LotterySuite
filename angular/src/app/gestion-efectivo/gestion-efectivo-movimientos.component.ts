import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DominicanCurrencyPipe } from 'src/app/shared/pipes/dominican-currency.pipe';
import { GestionEfectivoService, MovimientoEfectivoDto, TipoMovimientoLabels, TiposPositivos } from 'src/app/proxy/gestion-efectivo';

@Component({
  selector: 'app-gestion-efectivo-movimientos',
  standalone: true,
  imports: [SharedModule, DominicanCurrencyPipe],
  template: `
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card card-flush">
          <div class="card-header border-0 pt-6">
            <div class="card-title">
              <button class="btn btn-sm btn-light me-3" (click)="volver()">
                <i class="fas fa-arrow-left"></i>
              </button>
              <span class="text-gray-800 fw-bold fs-5">Movimientos — {{ nombreTerminal }}</span>
            </div>
          </div>
          <div class="card-body pt-2">
            <div class="table-responsive" *ngIf="movimientos.length > 0; else noData">
              <table class="table table-row-bordered align-middle gy-3 fs-7">
                <thead>
                  <tr class="fw-bold text-muted">
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th class="text-end">Monto</th>
                    <th class="text-end">Saldo Anterior</th>
                    <th class="text-end">Saldo Nuevo</th>
                    <th>Registrado Por</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of movimientos">
                    <td>{{ m.fechaMovimiento | date:'dd/MM/yyyy h:mm a' }}</td>
                    <td>
                      <span class="badge" [ngClass]="esPositivo(m.tipo) ? 'badge-light-success' : 'badge-light-danger'">
                        {{ getLabel(m.tipo) }}
                      </span>
                    </td>
                    <td class="text-end fw-bold" [ngClass]="esPositivo(m.tipo) ? 'text-success' : 'text-danger'">
                      {{ esPositivo(m.tipo) ? '+' : '-' }}{{ m.monto | dominicanCurrency:false }}
                    </td>
                    <td class="text-end">{{ m.saldoAnterior | dominicanCurrency }}</td>
                    <td class="text-end fw-bold" [ngClass]="m.saldoNuevo >= 0 ? 'text-success' : 'text-danger'">
                      {{ m.saldoNuevo | dominicanCurrency }}
                    </td>
                    <td>{{ m.registradoPor }}</td>
                    <td class="text-muted">{{ m.notas || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noData>
              <div class="text-center py-10 text-gray-500">
                <i class="fas fa-exchange-alt fs-2x mb-3 d-block"></i>
                No hay movimientos registrados
              </div>
            </ng-template>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-4" *ngIf="totalCount > pageSize">
              <span class="text-muted fs-7">{{ totalCount }} movimientos</span>
              <div>
                <button class="btn btn-sm btn-light me-1" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="btn btn-sm btn-light" [disabled]="(currentPage + 1) * pageSize >= totalCount" (click)="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GestionEfectivoMovimientosComponent implements OnInit {
  terminalId = '';
  nombreTerminal = '';
  movimientos: MovimientoEfectivoDto[] = [];
  totalCount = 0;
  currentPage = 0;
  pageSize = 20;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: GestionEfectivoService
  ) {}

  ngOnInit(): void {
    this.terminalId = this.route.snapshot.params['terminalId'];
    this.loadMovimientos();
  }

  loadMovimientos(): void {
    this.service.getMovimientos(this.terminalId, {
      skipCount: this.currentPage * this.pageSize,
      maxResultCount: this.pageSize
    }).subscribe(result => {
      this.movimientos = result.items ?? [];
      this.totalCount = result.totalCount ?? 0;
      if (this.movimientos.length > 0) {
        this.nombreTerminal = this.movimientos[0].nombreTerminal;
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadMovimientos();
  }

  getLabel(tipo: number): string {
    return TipoMovimientoLabels[tipo] || 'Otro';
  }

  esPositivo(tipo: number): boolean {
    return TiposPositivos.includes(tipo);
  }

  volver(): void {
    this.router.navigate(['/gestion-efectivo']);
  }
}
