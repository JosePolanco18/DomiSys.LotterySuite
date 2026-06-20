import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { TicketDto, TicketService } from 'src/app/proxy/ventas';

@Component({
  selector: 'app-ticket-detalle',
  standalone: true,
  imports: [CommonModule, SharedModule, FormToolbarComponent],
  template: `
    <app-form-toolbar
      [config]="formToolbarConfig"
      (back)="volver()">
    </app-form-toolbar>

    <div class="card card-flush mb-5" *ngIf="ticket">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <span class="text-gray-800 fw-bold fs-5">Informacion del Ticket</span>
        </div>
      </div>
      <div class="card-body pt-2">
        <div class="row mb-5">
          <div class="col-md-4 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Codigo</span>
            <span class="text-gray-800 fw-bold fs-5">{{ ticket.codigoTicket }}</span>
          </div>
          <div class="col-md-4 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Terminal</span>
            <span class="text-gray-800 fw-bold fs-5">{{ ticket.nombreTerminal }}</span>
          </div>
          <div class="col-md-4 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Vendedor</span>
            <span class="text-gray-800 fw-bold fs-5">{{ ticket.nombreVendedor }}</span>
          </div>
          <div class="col-md-4 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Fecha</span>
            <span class="text-gray-800 fw-semibold">{{ ticket.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="col-md-4 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Estado</span>
            <span class="badge" [ngClass]="{
              'badge-light-success': ticket.estado === 0,
              'badge-light-warning': ticket.estado === 1,
              'badge-light-info': ticket.estado === 2,
              'badge-light-primary': ticket.estado === 3,
              'badge-light-danger': ticket.estado === 4
            }">{{ estadoLabel }}</span>
          </div>
          <div class="col-md-2 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Monto Total</span>
            <span class="text-gray-800 fw-bold">{{ ticket.montoTotal | number:'1.2-2' }}</span>
          </div>
          <div class="col-md-2 mb-4">
            <span class="text-gray-500 fw-semibold fs-7 d-block mb-1">Premios</span>
            <span class="text-success fw-bold">{{ ticket.totalPremios | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="separator mb-5"></div>

        <h6 class="text-gray-800 fw-bold fs-5 mb-5">Jugadas</h6>
        <div class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 gy-4 gs-4 align-middle">
            <thead>
              <tr class="text-gray-500 fw-semibold fs-7 text-uppercase">
                <th>Sorteo</th>
                <th>Tipo</th>
                <th>Numeros</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Multiplicador</th>
                <th class="text-end">Premio</th>
                <th class="text-center">Ganador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of ticket.detalles">
                <td class="text-gray-600">{{ d.nombreLoteria }} - {{ d.nombreSorteo }}</td>
                <td class="text-gray-800 fw-semibold">{{ tipoJugadaLabel(d.tipoJugada) }}</td>
                <td class="text-gray-800 fw-bold">{{ formatNumeros(d) }}</td>
                <td class="text-end text-gray-800 fw-bold">{{ d.monto | number:'1.2-2' }}</td>
                <td class="text-end text-gray-600">x{{ d.multiplicadorPago }}</td>
                <td class="text-end text-success fw-bold">{{ d.montoPremio | number:'1.2-2' }}</td>
                <td class="text-center">
                  <span *ngIf="d.esGanador" class="badge badge-light-success">Ganador</span>
                  <span *ngIf="!d.esGanador" class="text-gray-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card card-flush" *ngIf="!ticket && !loading">
      <div class="card-body text-center text-gray-500 py-10">
        <i class="fas fa-ticket-alt fs-3x text-gray-300 mb-4 d-block"></i>
        <p class="fw-semibold fs-6">Ticket no encontrado.</p>
      </div>
    </div>
  `
})
export class TicketDetalleComponent implements OnInit {
  ticket: TicketDto | null = null;
  loading = true;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Detalle de Ticket',
    showBackButton: true,
    showSaveButton: false,
    showCancelButton: false,
    sticky: true
  };

  private readonly estadoLabels: Record<number, string> = {
    0: 'Pendiente',
    1: 'Activo',
    2: 'Ganador',
    3: 'Pagado',
    4: 'Anulado'
  };

  private readonly tipoLabels: Record<number, string> = {
    1: 'Quiniela',
    2: 'Pale',
    3: 'Tripleta',
    4: 'Super Pale'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ticketService.get(id).subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  get estadoLabel(): string {
    return this.ticket ? (this.estadoLabels[this.ticket.estado] ?? 'Desconocido') : '';
  }

  tipoJugadaLabel(tipo: number): string {
    return this.tipoLabels[tipo] ?? 'Desconocido';
  }

  formatNumeros(d: any): string {
    const nums = [d.primerNumero?.toString().padStart(2, '0')];
    if (d.segundoNumero != null) nums.push(d.segundoNumero.toString().padStart(2, '0'));
    if (d.tercerNumero != null) nums.push(d.tercerNumero.toString().padStart(2, '0'));
    return nums.join('-');
  }

  volver(): void {
    this.router.navigate(['/ventas/tickets']);
  }
}
