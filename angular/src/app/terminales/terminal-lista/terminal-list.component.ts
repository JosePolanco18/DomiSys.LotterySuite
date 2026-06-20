import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { TerminalDto, TerminalService } from 'src/app/proxy/terminales';

@Component({
  selector: 'app-terminal-list',
  templateUrl: './terminal-list.component.html',
  standalone: true,
  imports: [SharedModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class TerminalListComponent extends BaseListComponent<TerminalDto> {
  protected config: BaseListConfig = {
    entityName: 'Terminal',
    entityNamePlural: 'Terminales',
    listRoute: '/terminales',
    newRoute: '/terminales/nueva',
    editRoute: '/terminales/editar',
    searchPlaceholder: 'Buscar terminal...',
    addButtonLabel: 'Nueva Terminal',
    permissions: {
      edit: 'LotterySuite.Terminales.Edit',
      delete: 'LotterySuite.Terminales.Delete'
    }
  };

  protected columns: TableColumn[] = [
    { field: 'codigo', header: 'Código', sortable: true, filterable: true },
    { field: 'nombre', header: 'Nombre', sortable: true, filterable: true },
    { field: 'nombreVendedor', header: 'Vendedor', sortable: true },
    { field: 'estadoTexto', header: 'Estado', type: 'badge', sortable: true },
    { field: 'ubicacion', header: 'Ubicación' },
    { field: 'ultimaActividad', header: 'Última Actividad', type: 'date' }
  ];

  protected service = this.terminalService;

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private terminalService: TerminalService
  ) {
    super(list, confirmationService, toasterService, router);
  }

  protected getGlobalFilterFields(): string[] {
    return ['codigo', 'nombre', 'nombreVendedor'];
  }

  protected transformData(items: TerminalDto[]): TerminalDto[] {
    return items.map(i => ({
      ...i,
      estadoTexto: i.estado === 1 ? 'Activa' : i.estado === 2 ? 'Suspendida' : 'Bloqueada'
    }));
  }

  protected getSpecificActions(): TableAction[] {
    return [
      { label: 'Activar', icon: 'pi pi-check-circle', onClick: (row) => this.cambiarEstado(row.id!, 'activar') },
      { label: 'Suspender', icon: 'pi pi-pause', onClick: (row) => this.cambiarEstado(row.id!, 'suspender') },
      { label: 'Bloquear', icon: 'pi pi-ban', onClick: (row) => this.cambiarEstado(row.id!, 'bloquear') }
    ];
  }

  protected getEntityDisplayName(entity: TerminalDto): string {
    return `${entity.codigo} - ${entity.nombre}`;
  }

  private cambiarEstado(id: string, accion: string): void {
    const service$ = accion === 'activar' ? this.terminalService.activar(id)
      : accion === 'suspender' ? this.terminalService.suspender(id)
      : this.terminalService.bloquear(id);

    service$.subscribe(() => {
      this.toasterService.success(`Terminal ${accion === 'activar' ? 'activada' : accion === 'suspender' ? 'suspendida' : 'bloqueada'}`);
      this.list.get();
    });
  }
}
