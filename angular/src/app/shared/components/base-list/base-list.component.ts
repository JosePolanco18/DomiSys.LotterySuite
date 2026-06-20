import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListService, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { Observable } from 'rxjs';
import { ToolbarConfig, ToolbarButton } from 'src/app/shared/components/toolbar/models/toolbar.interface';
import { TableConfig, TableColumn, TableAction } from 'src/app/shared/components/table/models/table.interface';

export interface BaseListEntityDto {
  id?: string;
  [key: string]: any;
}

export interface BaseListService<TEntity extends BaseListEntityDto> {
  getList(input: PagedAndSortedResultRequestDto): Observable<PagedResultDto<TEntity>>;
  delete(id: string): Observable<void>;
  [key: string]: any;
}

export interface BaseListConfig {
  entityName: string;
  entityNamePlural: string;
  listRoute: string;
  newRoute?: string; // Hacer opcional
  editRoute?: string; // Hacer opcional
  searchPlaceholder?: string;
  addButtonLabel?: string;
  showDeleteOption?: boolean;
  showAddButton?: boolean; // Nueva opción
  permissions?: {
    edit?: string;
    delete?: string;
  };
}

@Component({
  template: ''
})
export abstract class BaseListComponent<TEntity extends BaseListEntityDto, TQuery = PagedAndSortedResultRequestDto> implements OnInit {
  data: TEntity[] = [];
  loading = false;
  filterText = '';
  searchText = '';
  tableConfig!: TableConfig;
  toolbarConfig!: ToolbarConfig;

  protected abstract config: BaseListConfig;
  protected service?: BaseListService<TEntity>; // Hacer opcional
  protected abstract columns: TableColumn[];

  constructor(
    public readonly list: ListService<TQuery>,
    protected confirmationService: ConfirmationService,
    protected toasterService: ToasterService,
    protected router: Router
  ) {}

  ngOnInit() {
    this.initializeTable();
    this.initializeToolbar();
    this.setupListService();
    this.setupDataQuery();
  }

  private setupListService() {
    this.list.page = 0;
    this.list.maxResultCount = 10;
    this.list.sortKey = '';
    this.list.sortOrder = '';
  }

  protected initializeTable() {
    const baseActions: TableAction[] = [];
    
    // Solo agregar acción de editar si hay ruta de edición
    if (this.config.editRoute) {
      baseActions.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        onClick: (rowData: TEntity) => this.editEntity(rowData),
        visible: (rowData: TEntity) => this.hasPermission(this.config.permissions?.edit)
      });
    }
    
    // Solo agregar acción de eliminar si showDeleteOption no es false
    if (this.config.showDeleteOption !== false && this.service) {
      baseActions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        onClick: (rowData: TEntity) => this.delete(rowData.id!, this.getEntityDisplayName(rowData)),
        styleClass: 'text-danger',
        visible: (rowData: TEntity) => this.hasPermission(this.config.permissions?.delete)
      });
    }

    // Agregar acciones específicas del componente hijo
    const specificActions = this.getSpecificActions();
    const allActions = [...baseActions, ...specificActions];

    // Crear columna de acciones
    const actionsColumn: TableColumn = {
      field: 'actions',
      header: 'Acciones',
      type: 'actions',
      sortable: false,
      filterable: false,
      width: '140px',
      styleClass: 'text-center'
    };

    // Combinar columnas
    const allColumns: TableColumn[] = [actionsColumn, ...this.columns];

    // Configuración base de la tabla
    const baseTableConfig: TableConfig = {
      columns: allColumns,
      actions: allActions,
      data: [],
      loading: false,
      paginator: true,
      rows: 10,
      totalRecords: 0,
      lazy: true,
      showGridlines: true,
      responsive: true,
      emptyMessage: `No se encontraron ${this.config.entityNamePlural}`,
      globalFilterFields: this.getGlobalFilterFields()
    };

    this.tableConfig = this.getTableConfig(baseTableConfig);
  }

  protected getTableConfig(baseConfig: TableConfig): TableConfig {
    return baseConfig;
  }

  protected getSpecificActions(): TableAction[] {
    return [];
  }

  protected initializeToolbar() {
    const baseButtons: ToolbarButton[] = [
      {
        id: 'search',
        label: 'Buscar',
        icon: 'pi-search',
        variant: 'secondary',
        outline: true,
        size: 'lg',
        order: 1,
        onClick: () => this.performSearch()
      }
    ];

    // Solo agregar botón de "Agregar" si showAddButton no es false y hay newRoute
    if (this.config.showAddButton !== false && this.config.newRoute) {
      baseButtons.push({
        id: 'add',
        label: this.config.addButtonLabel || `Agregar ${this.config.entityName.toLowerCase()}`,
        icon: 'pi-plus',
        variant: 'primary',
        size: 'lg',
        order: 2,
        onClick: () => this.addEntity()
      });
    }

    const specificButtons = this.getSpecificToolbarButtons();
    const allButtons = [...baseButtons, ...specificButtons].sort((a, b) => a.order - b.order);

    this.toolbarConfig = {
      title: this.config.entityNamePlural,
      subTitle: `Gestión de ${this.config.entityNamePlural.toLowerCase()}`,
      showSearch: true,
      searchPlaceholder: this.config.searchPlaceholder || `Buscar ${this.config.entityNamePlural.toLowerCase()}...`,
      buttons: allButtons
    };
  }

  protected getSpecificToolbarButtons(): ToolbarButton[] {
    return [];
  }

  protected setupDataQuery() {
    const getData = (query: TQuery) => {
      const page = isNaN(this.list.page) ? 0 : this.list.page;
      const maxResultCount = isNaN(this.list.maxResultCount) ? 10 : this.list.maxResultCount;
      const skipCount = page * maxResultCount;
      
      const baseQuery = {
        ...query,
        filter: this.filterText || undefined,
        skipCount: skipCount,
        maxResultCount: maxResultCount
      } as TQuery;
      
      return this.loadData(baseQuery);
    };

    this.list.hookToQuery(getData).subscribe(response => {
      this.data = this.transformData(response.items);
      this.updateTableConfig(response.totalCount);
    });

    this.list.get();
  }

  protected loadData(query: TQuery): Observable<PagedResultDto<TEntity>> {
    // Si no hay service definido, lanzar error
    if (!this.service) {
      throw new Error('Service is required or loadData must be overridden');
    }
    return this.service.getList(query as any);
  }

  private updateTableConfig(totalCount: number) {
    this.tableConfig = {
      ...this.tableConfig,
      data: this.data,
      totalRecords: totalCount
    };
  }

  protected abstract getEntityDisplayName(entity: TEntity): string;
  protected abstract getGlobalFilterFields(): string[];
  protected abstract transformData(items: TEntity[]): TEntity[];

  addEntity() {
    if (this.config.newRoute) {
      this.router.navigate([this.config.newRoute]);
    }
  }

  editEntity(entity: TEntity) {
    if (this.config.editRoute) {
      this.router.navigate([this.config.editRoute, entity.id]);
    }
  }

  handlePageChange(event: any) {
    const page = event.page !== undefined ? event.page : Math.floor((event.first || 0) / (event.rows || 10));
    const rows = event.rows || 10;
    this.list.page = page;
    this.list.maxResultCount = rows;    
    this.list.get();
  }

  handleSort(event: any) {
    if (event.field) {
      const direction = event.order === 1 ? 'asc' : 'desc';
      this.list.sortKey = event.field;
      this.list.sortOrder = direction;
    }
  }

  handleLazyLoad(event: any) {
  }

  handleRowSelect(event: any) {
  }

  onToolbarSearch(searchValue: string) {
    this.searchText = searchValue;
  }

  performSearch() {
    this.filterText = this.searchText;
    this.list.get();
  }

  delete(id: string, name: string) {
    if (!this.service) {
      this.toasterService.error('Operación de eliminación no disponible');
      return;
    }

    this.confirmationService
      .warn(
        `¿Está seguro de que quiere eliminar "${name}"?`,
        '¿Está seguro?'
      )
      .subscribe((status) => {
        if (status === 'confirm' && this.service) {
          this.service.delete(id).subscribe(() => {
            this.toasterService.success(`${this.config.entityName} "${name}" eliminado exitosamente`);
            this.list.get();
          });
        }
      });
  }

  protected hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return true;
  }

  trackByFn(index: number, item: TEntity): string {
    return item.id!;
  }
}