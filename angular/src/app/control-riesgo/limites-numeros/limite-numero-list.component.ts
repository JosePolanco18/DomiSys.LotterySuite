import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { LimiteNumeroDto, LimiteNumeroService } from 'src/app/proxy/control-riesgo';

@Component({
  selector: 'app-limite-numero-list',
  templateUrl: './limite-numero-list.component.html',
  standalone: true,
  imports: [SharedModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class LimiteNumeroListComponent extends BaseListComponent<LimiteNumeroDto> {
  protected service = this.limiteService;

  protected config: BaseListConfig = {
    entityName: 'Límite',
    entityNamePlural: 'Límites por Número',
    listRoute: '/control-riesgo/limites',
    newRoute: '/control-riesgo/limites/nuevo',
    editRoute: '/control-riesgo/limites/editar',
    searchPlaceholder: 'Buscar por número...',
    addButtonLabel: 'Nuevo Límite',
    permissions: {}
  };

  protected columns: TableColumn[] = [
    { field: 'nombreLoteria', header: 'Lotería', sortable: true },
    { field: 'nombreSorteo', header: 'Sorteo', sortable: true },
    { field: 'numero', header: 'Número', sortable: true },
    { field: 'limiteVentaMaximo', header: 'Límite Venta', pipe: 'currency' },
    { field: 'limiteAguante', header: 'Aguante', pipe: 'currency' },
    { field: 'bloqueadoTexto', header: 'Bloqueado', type: 'badge' }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private limiteService: LimiteNumeroService
  ) {
    super(list, confirmationService, toasterService, router);
  }

  protected getGlobalFilterFields(): string[] {
    return ['nombreLoteria', 'nombreSorteo', 'numero'];
  }

  protected transformData(items: LimiteNumeroDto[]): LimiteNumeroDto[] {
    return items.map(i => ({ ...i, bloqueadoTexto: i.bloqueado ? 'Sí' : 'No' }));
  }

  protected getSpecificActions(): TableAction[] { return []; }

  protected getEntityDisplayName(entity: LimiteNumeroDto): string {
    return `${entity.nombreLoteria} - #${entity.numero}`;
  }
}
