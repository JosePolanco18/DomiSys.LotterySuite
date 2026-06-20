import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { TicketDto, TicketService } from 'src/app/proxy/ventas';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  standalone: true,
  imports: [SharedModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class TicketListComponent extends BaseListComponent<TicketDto> {
  protected config: BaseListConfig = {
    entityName: 'Ticket',
    entityNamePlural: 'Tickets',
    listRoute: '/ventas/tickets',
    showAddButton: false,
    showDeleteOption: false,
    searchPlaceholder: 'Buscar ticket...',
    permissions: {}
  };

  protected columns: TableColumn[] = [
    { field: 'codigoTicket', header: 'Código', sortable: true, filterable: true },
    { field: 'nombreTerminal', header: 'Terminal', sortable: true },
    { field: 'nombreVendedor', header: 'Vendedor', sortable: true },
    { field: 'fechaCreacion', header: 'Fecha', type: 'date', sortable: true },
    { field: 'montoTotal', header: 'Monto', type: 'text', sortable: true },
    { field: 'totalPremios', header: 'Premios', type: 'text' },
    { field: 'estado', header: 'Estado', sortable: true }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private ticketService: TicketService
  ) {
    super(list, confirmationService, toasterService, router);
    this.service = {
      getList: (input) => this.ticketService.getList(input),
      delete: () => { throw new Error('No se pueden eliminar tickets'); }
    };
  }

  protected getGlobalFilterFields(): string[] {
    return ['codigoTicket', 'nombreTerminal', 'nombreVendedor'];
  }

  protected transformData(items: TicketDto[]): TicketDto[] {
    return items;
  }

  protected getSpecificActions(): TableAction[] {
    return [
      { label: 'Anular', icon: 'pi pi-times', onClick: (row) => this.anularTicket(row) },
      { label: 'Pagar', icon: 'pi pi-money-bill', onClick: (row) => this.pagarGanador(row) }
    ];
  }

  protected getEntityDisplayName(entity: TicketDto): string {
    return entity.codigoTicket || '';
  }

  private anularTicket(ticket: TicketDto): void {
    if (ticket.estado !== 1) return;
    this.confirmationService.warn('¿Está seguro de anular este ticket?', 'Confirmar Anulación').subscribe(result => {
      if (result === 'confirm') {
        this.ticketService.anular(ticket.id!, { motivoAnulacion: 'Anulado desde panel admin' }).subscribe(() => {
          this.toasterService.success('Ticket anulado');
          this.list.get();
        });
      }
    });
  }

  private pagarGanador(ticket: TicketDto): void {
    if (ticket.estado !== 2) return;
    this.ticketService.pagarGanador(ticket.id!).subscribe(() => {
      this.toasterService.success('Ticket pagado');
      this.list.get();
    });
  }
}
