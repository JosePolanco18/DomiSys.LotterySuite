import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { BaseListComponent, BaseListConfig } from 'src/app/shared/components/base-list/base-list.component';
import { TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ToolbarComponent } from 'src/app/shared/components/toolbar/toolbar.component';
import { ResultadoSorteoDto, ResultadoSorteoService } from 'src/app/proxy/loterias';
import { ResultadoScrapedDto, ResultadosGeneralesService } from 'src/app/proxy/reportes/resultados-generales.service';

@Component({
  selector: 'app-resultado-sorteo-list',
  templateUrl: './resultado-sorteo-list.component.html',
  standalone: true,
  imports: [SharedModule, CommonModule, TableComponent, ToolbarComponent],
  providers: [ListService]
})
export class ResultadoSorteoListComponent extends BaseListComponent<ResultadoSorteoDto> implements OnInit {
  activeTab: 'mis-sorteos' | 'todos' = 'todos';
  resultadosGenerales: ResultadoScrapedDto[] = [];
  loadingGenerales = false;

  protected config: BaseListConfig = {
    entityName: 'Resultado',
    entityNamePlural: 'Resultados',
    listRoute: '/loterias/resultados',
    newRoute: '/loterias/resultados/registrar',
    addButtonLabel: 'Registrar Resultado',
    showDeleteOption: false,
    permissions: {}
  };

  protected columns: TableColumn[] = [
    { field: 'nombreLoteria', header: 'Lotería', sortable: true },
    { field: 'nombreSorteo', header: 'Sorteo', sortable: true },
    { field: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { field: 'primera', header: '1ra' },
    { field: 'segunda', header: '2da' },
    { field: 'tercera', header: '3ra' },
    { field: 'verificado', header: 'Verificado' }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private resultadoService: ResultadoSorteoService,
    private resultadosGeneralesService: ResultadosGeneralesService
  ) {
    super(list, confirmationService, toasterService, router);
    this.service = {
      getList: (input) => this.resultadoService.getList(input),
      delete: () => { throw new Error('No se pueden eliminar resultados'); }
    };
  }

  override ngOnInit() {
    super.ngOnInit();
    this.cargarResultadosGenerales();
  }

  cargarResultadosGenerales(): void {
    this.loadingGenerales = true;
    this.resultadosGeneralesService.obtenerTodos().subscribe({
      next: (data) => { this.resultadosGenerales = data; this.loadingGenerales = false; },
      error: () => this.loadingGenerales = false
    });
  }

  protected getGlobalFilterFields(): string[] {
    return ['nombreLoteria', 'nombreSorteo'];
  }

  protected transformData(items: ResultadoSorteoDto[]): ResultadoSorteoDto[] {
    return items.map(i => ({ ...i, verificado: i.verificado ? 'Sí' : 'No' } as any));
  }

  protected getSpecificActions(): TableAction[] { return []; }
  protected getEntityDisplayName(entity: ResultadoSorteoDto): string {
    return `${entity.nombreLoteria} - ${entity.nombreSorteo}`;
  }
}
