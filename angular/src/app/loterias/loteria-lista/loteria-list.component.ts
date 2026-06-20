import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { LoteriaDto, LoteriaService } from 'src/app/proxy/loterias';

@Component({
  selector: 'app-loteria-list',
  templateUrl: './loteria-list.component.html',
  standalone: true,
  imports: [SharedModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class LoteriaListComponent extends BaseListComponent<LoteriaDto> {
  protected config: BaseListConfig = {
    entityName: 'Lotería',
    entityNamePlural: 'Loterías',
    listRoute: '/loterias',
    newRoute: '/loterias/nueva',
    editRoute: '/loterias/editar',
    searchPlaceholder: 'Buscar lotería...',
    addButtonLabel: 'Nueva Lotería',
    permissions: {
      edit: 'LotterySuite.Loterias.GestionLoterias.Edit',
      delete: 'LotterySuite.Loterias.GestionLoterias.Delete'
    }
  };

  protected columns: TableColumn[] = [
    { field: 'codigoCorto', header: 'Código', sortable: true, filterable: true },
    { field: 'nombre', header: 'Nombre', sortable: true, filterable: true },
    { field: 'orden', header: 'Orden', sortable: true },
    { field: 'activaTexto', header: 'Estado', type: 'badge' }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private loteriaService: LoteriaService
  ) {
    super(list, confirmationService, toasterService, router);
    this.service = this.loteriaService;
  }

  protected getGlobalFilterFields(): string[] {
    return ['codigoCorto', 'nombre'];
  }

  protected transformData(items: LoteriaDto[]): LoteriaDto[] {
    // ponytail: strip nested arrays that PrimeNG chokes on in lazy mode
    return items.map(i => ({ ...i, activaTexto: i.activa ? 'Activo' : 'Inactivo', sorteos: undefined, configuracionesPago: undefined }));
  }

  protected getSpecificActions(): TableAction[] {
    return [];
  }

  protected getEntityDisplayName(entity: LoteriaDto): string {
    return entity.nombre || '';
  }
}
