import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { CuadreTerminalDto, CuadreService } from 'src/app/proxy/cuadres';

@Component({
  selector: 'app-cuadre-list',
  templateUrl: './cuadre-list.component.html',
  standalone: true,
  imports: [SharedModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class CuadreListComponent extends BaseListComponent<CuadreTerminalDto> {
  protected config: BaseListConfig = {
    entityName: 'Cuadre',
    entityNamePlural: 'Cuadres',
    listRoute: '/cuadres',
    newRoute: '/cuadres/generar',
    addButtonLabel: 'Generar Cuadre',
    showDeleteOption: false,
    permissions: {}
  };

  protected columns: TableColumn[] = [
    { field: 'nombreTerminal', header: 'Terminal', sortable: true },
    { field: 'nombreVendedor', header: 'Vendedor', sortable: true },
    { field: 'fechaCuadre', header: 'Fecha Cuadre', type: 'date', sortable: true },
    { field: 'ventasBrutas', header: 'Ventas', type: 'text' },
    { field: 'totalPremiosPagados', header: 'Premios', type: 'text' },
    { field: 'montoComisionVenta', header: 'Com. Venta', type: 'text' },
    { field: 'montoComisionVerde', header: 'Com. Verde', type: 'text' },
    { field: 'balanceNeto', header: 'Balance Neto', type: 'text' },
    { field: 'quedoEnVerde', header: 'En Verde', type: 'badge' }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private cuadreService: CuadreService
  ) {
    super(list, confirmationService, toasterService, router);
    this.service = {
      getList: (input) => this.cuadreService.getList(input),
      delete: () => { throw new Error('No se pueden eliminar cuadres'); }
    };
  }

  protected getGlobalFilterFields(): string[] {
    return ['nombreTerminal', 'nombreVendedor'];
  }

  protected transformData(items: CuadreTerminalDto[]): CuadreTerminalDto[] {
    return items;
  }

  protected getSpecificActions(): TableAction[] { return []; }
  protected getEntityDisplayName(entity: CuadreTerminalDto): string {
    return `${entity.nombreTerminal} - ${entity.fechaCuadre}`;
  }
}
