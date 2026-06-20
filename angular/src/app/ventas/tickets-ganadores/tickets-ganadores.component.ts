import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { TicketDto, TicketService } from 'src/app/proxy/ventas';
import { ToasterService, ConfirmationService } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-tickets-ganadores',
  standalone: true,
  imports: [SharedModule, CommonModule, FormToolbarComponent],
  template: `
    <app-form-toolbar [config]="formToolbarConfig"></app-form-toolbar>

    <div class="card card-flush">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <span class="text-gray-800 fw-bold fs-5">Tickets con Premios</span>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="table-responsive" *ngIf="tickets.length > 0">
          <table class="table table-row-dashed table-row-gray-300 gy-5 gs-5 align-middle mb-0">
            <thead>
              <tr class="text-gray-500 fw-semibold fs-7 text-uppercase">
                <th>Codigo</th>
                <th>Terminal</th>
                <th>Vendedor</th>
                <th>Fecha</th>
                <th class="text-end">Monto Jugado</th>
                <th class="text-end">Premio</th>
                <th>Estado</th>
                <th class="text-end w-120px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tickets">
                <td class="text-gray-800 fw-bold">{{ t.codigoTicket }}</td>
                <td class="text-gray-600">{{ t.nombreTerminal }}</td>
                <td class="text-gray-600">{{ t.nombreVendedor }}</td>
                <td class="text-gray-600">{{ t.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="text-end text-gray-800 fw-bold">{{ t.montoTotal | number:'1.2-2' }}</td>
                <td class="text-end text-success fw-bold fs-5">RD$ {{ t.totalPremios | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [class.badge-light-warning]="t.estado === 2" [class.badge-light-success]="t.estado === 3">
                    {{ t.estado === 2 ? 'Pendiente de pago' : 'Pagado' }}
                  </span>
                </td>
                <td class="text-end">
                  <button *ngIf="t.estado === 2" class="btn btn-sm btn-light-success" (click)="pagarTicket(t)">
                    <i class="fas fa-hand-holding-usd me-1"></i> Pagar
                  </button>
                  <span *ngIf="t.estado === 3" class="text-gray-500 fs-7">
                    <i class="fas fa-check-circle text-success me-1"></i> {{ t.fechaPago | date:'dd/MM HH:mm' }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-light fw-bold">
                <td colspan="4" class="text-gray-800 fw-bold">Totales</td>
                <td class="text-end text-gray-800 fw-bold">{{ totalJugado | number:'1.2-2' }}</td>
                <td class="text-end text-success fw-bold fs-5">RD$ {{ totalPremios | number:'1.2-2' }}</td>
                <td colspan="2">
                  <span class="badge badge-light-warning me-1">{{ pendientes }} pendientes</span>
                  <span class="badge badge-light-success">{{ pagados }} pagados</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div *ngIf="tickets.length === 0 && !isLoading" class="text-center text-gray-500 py-10">
          <i class="fas fa-trophy fs-3x text-gray-300 mb-4 d-block"></i>
          <p class="fw-semibold fs-6">No hay tickets ganadores</p>
        </div>
        <div *ngIf="isLoading" class="text-center py-10">
          <div class="spinner-border text-primary"></div>
        </div>
      </div>
    </div>
  `
})
export class TicketsGanadoresComponent implements OnInit {
  tickets: TicketDto[] = [];
  isLoading = false;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Tickets Ganadores',
    subtitle: 'Tickets con premios pendientes y pagados',
    showSaveButton: false,
    showCancelButton: false,
    sticky: true,
    buttons: [{ id: 'refresh', label: 'Actualizar', icon: 'fas fa-sync-alt', variant: 'outline', onClick: () => this.cargar() }]
  };

  constructor(
    private ticketService: TicketService,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.isLoading = true;
    this.ticketService.getGanadores().subscribe({
      next: (data) => { this.tickets = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  pagarTicket(ticket: TicketDto): void {
    this.confirmationService.warn(`¿Pagar RD$ ${ticket.totalPremios?.toFixed(2)} del ticket ${ticket.codigoTicket}?`, 'Confirmar Pago')
      .subscribe(result => {
        if (result === 'confirm') {
          this.ticketService.pagarGanador(ticket.id!).subscribe(() => {
            this.toasterService.success('Ticket pagado');
            this.cargar();
          });
        }
      });
  }

  get totalJugado(): number { return this.tickets.reduce((s, t) => s + t.montoTotal, 0); }
  get totalPremios(): number { return this.tickets.reduce((s, t) => s + t.totalPremios, 0); }
  get pendientes(): number { return this.tickets.filter(t => t.estado === 2).length; }
  get pagados(): number { return this.tickets.filter(t => t.estado === 3).length; }
}
