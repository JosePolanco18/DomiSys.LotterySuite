import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { TableConfig, TableAction, TableColumn } from './models/table.interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    MenuModule,
    TagModule,
    ToolbarModule,
    InputTextModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent {
  @Input() config!: TableConfig;
  @Input() loading: boolean = false;
  @Input() toolbarTitle: string = '';
  @Input() createButtonLabel: string = 'Nuevo';
  @Input() createButtonIcon: string = 'ki-outline ki-plus';

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();
  @Output() filter = new EventEmitter<any>();
  @Output() page = new EventEmitter<any>();
  @Output() lazyLoad = new EventEmitter<any>();
  @Output() createClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<{ action: TableAction, rowData: any }>();

  @ContentChild('customColumn', { static: false }) customColumnTemplate!: TemplateRef<any>;
  @ViewChild('dt') dt!: Table;

  globalFilterValue: string = '';
  selectedItems: any[] = [];
  menuItems: MenuItem[] = [];
  private selectedRowData: any;

  constructor() { }

  defaultConfig: Partial<TableConfig> = {
    paginator: true,
    rows: 10,
    responsive: true,
    showGridlines: false,
    emptyMessage: 'No se encontraron registros'
  };

  get tableConfig(): TableConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
    this.dt.filterGlobal(target.value, 'contains');
  }

  clear() {
    this.globalFilterValue = '';
    this.dt.clear();
  }

  handleActionClick(action: TableAction, rowData: any) {
    if (action.onClick) {
      action.onClick(rowData);
    }
    this.actionClick.emit({ action, rowData });
  }

  setSelectedRowData(rowData: any) {
    this.selectedRowData = rowData;
    this.generateMenuItems();
  }

  generateMenuItems() {
    if (!this.config.actions) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.config.actions.map(action => ({
      label: action.label,
      icon: action.icon || 'ki-outline ki-setting-2',
      command: () => this.handleActionClick(action, this.selectedRowData),
      visible: action.visible ? action.visible(this.selectedRowData) : true,
      disabled: action.disabled ? action.disabled(this.selectedRowData) : false,
      styleClass: action.styleClass
    }));
  }

  /**
   * Obtiene las clases CSS para una fila específica
   */
  getRowStyleClass(rowData: any): string {
    let classes = '';

    // Aplicar estilos basados en condiciones
    if (this.config.rowStyles) {
      this.config.rowStyles.forEach(style => {
        if (style.condition(rowData) && style.styleClass) {
          classes += ` ${style.styleClass}`;
        }
      });
    }

    // Aplicar función de estilo de clase personalizada
    if (this.config.rowStyleClass) {
      const customClass = this.config.rowStyleClass(rowData);
      if (customClass) {
        classes += ` ${customClass}`;
      }
    }

    return classes.trim();
  }
  getRowBackgroundColor(rowData: any): string | null {
    if (rowData && rowData.status) {
      if (rowData.status == 'Cancelled') {
        return '#f8d7da';
      }
    }
  
  }

  /**
   * Obtiene los estilos inline para una fila específica
   */
  getRowInlineStyles(rowData: any): { [key: string]: string } {
    let styles: { [key: string]: string } = {};

    // Aplicar estilos basados en condiciones
    if (this.config.rowStyles) {
      this.config.rowStyles.forEach(style => {
        if (style.condition(rowData) && style.style) {
          styles = { ...styles, ...style.style };
        }
      });
    }

    // Aplicar función de estilo inline personalizada
    if (this.config.rowStyleFunction) {
      const customStyles = this.config.rowStyleFunction(rowData);
      if (customStyles) {
        styles = { ...styles, ...customStyles };
      }
    }

    return styles;
  }

  /**
   * Mapea valores de estado a colores de badge de Metronic
   */
  getBadgeColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'activo':
      case 'active':
      case 'enabled':
      case 'completado':
      case 'completed':
      case 'aprobado':
      case 'approved':
        return 'success';

      case 'inactivo':
      case 'inactive':
      case 'disabled':
      case 'rechazado':
      case 'rejected':
      case 'cancelado':
      case 'cancelled':
        return 'danger';

      case 'pendiente':
      case 'pending':
      case 'en proceso':
      case 'processing':
      case 'revision':
      case 'review':
        return 'warning';

      case 'borrador':
      case 'draft':
      case 'nuevo':
      case 'new':
        return 'info';

      case 'prioritario':
      case 'priority':
      case 'importante':
      case 'important':
        return 'primary';

      default:
        return 'secondary';
    }
  }

  /**
   * Mantiene la funcionalidad de formateo
   */
  formatCellValue(value: any, column: TableColumn): any {
    if (!value && value !== 0) return '-';

    if (column.pipe) {
      switch (column.pipe) {
        case 'date':
          return new Date(value).toLocaleDateString('es-DO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        case 'datetime':
          return new Date(value).toLocaleString('es-DO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        case 'currency':
          return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
          }).format(value);
        case 'number':
          return new Intl.NumberFormat('es-DO').format(value);
        case 'percent':
          return new Intl.NumberFormat('es-DO', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }).format(value / 100);
        default:
          return value;
      }
    }

    return value;
  }

  // Event handlers
  handleRowSelect(event: any) {
    this.rowSelect.emit(event);
  }

  handleRowUnselect(event: any) {
    this.rowUnselect.emit(event);
  }

  handleSort(event: any) {
    this.sort.emit(event);
  }

  handleFilter(event: any) {
    this.filter.emit(event);
  }

  handlePage(event: any) {
    this.page.emit(event);
  }

  handleLazyLoad(event: any) {
    this.lazyLoad.emit(event);
  }

  handleCreateClick() {
    this.createClick.emit();
  }
}