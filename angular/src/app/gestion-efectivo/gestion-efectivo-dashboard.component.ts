import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { DominicanCurrencyPipe } from 'src/app/shared/pipes/dominican-currency.pipe';
import { GestionEfectivoService, ResumenEfectivoTerminalDto, RegistrarTransferenciaDto } from 'src/app/proxy/gestion-efectivo';

@Component({
  selector: 'app-gestion-efectivo-dashboard',
  standalone: true,
  imports: [SharedModule, DominicanCurrencyPipe],
  template: `
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card card-flush mb-5">
          <div class="card-header border-0 pt-6">
            <div class="card-title">
              <span class="text-gray-800 fw-bold fs-5">Gestion de Efectivo</span>
            </div>
            <div class="card-toolbar">
              <button class="btn btn-sm btn-light-primary" (click)="loadData()">
                <i class="fas fa-sync-alt me-1"></i> Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="row mb-5">
          <div class="col-md-4">
            <div class="card card-flush">
              <div class="card-body py-4">
                <div class="text-gray-500 fw-semibold fs-7">Total Efectivo</div>
                <div class="fw-bold fs-3" [ngClass]="totalEfectivo >= 0 ? 'text-success' : 'text-danger'">
                  {{ totalEfectivo | dominicanCurrency }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-flush">
              <div class="card-body py-4">
                <div class="text-gray-500 fw-semibold fs-7">En Verde</div>
                <div class="fw-bold fs-3 text-success">{{ terminalesEnVerde }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-flush">
              <div class="card-body py-4">
                <div class="text-gray-500 fw-semibold fs-7">En Rojo</div>
                <div class="fw-bold fs-3 text-danger">{{ terminalesEnRojo }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminals table -->
        <div class="card card-flush">
          <div class="card-body pt-2">
            <div class="table-responsive" *ngIf="terminales.length > 0; else noData">
              <table class="table table-row-bordered align-middle gy-4">
                <thead>
                  <tr class="fw-bold text-muted">
                    <th>Terminal</th>
                    <th>Vendedor</th>
                    <th class="text-end">Saldo Efectivo</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of terminales">
                    <td>
                      <a class="text-primary fw-bold cursor-pointer" (click)="verMovimientos(t.terminalId)">{{ t.nombre }}</a>
                    </td>
                    <td>{{ t.nombreVendedor }}</td>
                    <td class="text-end fw-bold" [ngClass]="t.saldoEfectivo >= 0 ? 'text-success' : 'text-danger'">
                      {{ t.saldoEfectivo | dominicanCurrency }}
                    </td>
                    <td>
                      <span class="badge" [ngClass]="t.estaEnVerde ? 'badge-light-success' : 'badge-light-danger'">
                        {{ t.estaEnVerde ? 'Verde' : 'Rojo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-light-success me-1" (click)="openModal(t, 'entregar')">
                        <i class="fas fa-arrow-down me-1"></i> Entregar
                      </button>
                      <button class="btn btn-sm btn-light-warning" (click)="openModal(t, 'recibir')">
                        <i class="fas fa-arrow-up me-1"></i> Recibir
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noData>
              <div class="text-center py-10 text-gray-500">
                <i class="fas fa-wallet fs-2x mb-3 d-block"></i>
                No hay terminales registradas
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ modalTitle }}</h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-4">
                  <label class="form-label fw-semibold">Terminal</label>
                  <div class="text-gray-800">{{ selectedTerminal?.nombre }}</div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Monto (RD$)</label>
                  <input type="number" class="form-control" [(ngModel)]="modalMonto" [min]="1" placeholder="0.00">
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Notas</label>
                  <textarea class="form-control" [(ngModel)]="modalNotas" rows="2" placeholder="Opcional"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-light" (click)="closeModal()">Cancelar</button>
                <button class="btn" [ngClass]="modalTipo === 'entregar' ? 'btn-success' : 'btn-warning'" (click)="confirmarTransferencia()" [disabled]="isSaving || !modalMonto || modalMonto <= 0">
                  {{ isSaving ? 'Procesando...' : 'Confirmar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="showModal"></div>
      </div>
    </div>
  `
})
export class GestionEfectivoDashboardComponent implements OnInit {
  terminales: ResumenEfectivoTerminalDto[] = [];
  totalEfectivo = 0;
  terminalesEnVerde = 0;
  terminalesEnRojo = 0;

  showModal = false;
  modalTipo: 'entregar' | 'recibir' = 'entregar';
  selectedTerminal: ResumenEfectivoTerminalDto | null = null;
  modalMonto: number | null = null;
  modalNotas = '';
  isSaving = false;

  get modalTitle(): string {
    return this.modalTipo === 'entregar'
      ? 'Entregar Fondos a Terminal'
      : 'Recibir Fondos de Terminal';
  }

  constructor(
    private service: GestionEfectivoService,
    private toaster: ToasterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getResumenTerminales().subscribe(data => {
      this.terminales = data;
      this.totalEfectivo = data.reduce((s, t) => s + t.saldoEfectivo, 0);
      this.terminalesEnVerde = data.filter(t => t.estaEnVerde).length;
      this.terminalesEnRojo = data.filter(t => !t.estaEnVerde).length;
    });
  }

  verMovimientos(terminalId: string): void {
    this.router.navigate(['/gestion-efectivo', 'terminal', terminalId]);
  }

  openModal(terminal: ResumenEfectivoTerminalDto, tipo: 'entregar' | 'recibir'): void {
    this.selectedTerminal = terminal;
    this.modalTipo = tipo;
    this.modalMonto = null;
    this.modalNotas = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTerminal = null;
  }

  confirmarTransferencia(): void {
    if (!this.selectedTerminal || !this.modalMonto || this.modalMonto <= 0) return;
    this.isSaving = true;

    const input: RegistrarTransferenciaDto = {
      terminalId: this.selectedTerminal.terminalId,
      monto: this.modalMonto,
      notas: this.modalNotas || undefined
    };

    const call = this.modalTipo === 'entregar'
      ? this.service.registrarEntregaAdmin(input)
      : this.service.registrarEntregaTerminal(input);

    call.subscribe({
      next: () => {
        this.toaster.success(this.modalTipo === 'entregar' ? 'Fondos entregados' : 'Fondos recibidos');
        this.closeModal();
        this.loadData();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
