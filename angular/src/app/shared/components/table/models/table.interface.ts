export interface TableAction {
  label: string;
  icon?: string;
  onClick: (rowData: any) => void;
  styleClass?: string;
  visible?: (rowData: any) => boolean; 
  disabled?: (rowData: any) => boolean;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'date' | 'actions' | 'custom';
  badgeClass?: string;
  sortable?: boolean;
  sortField?: string;
  filterable?: boolean;
  width?: string;
  styleClass?: string;
  pipe?: string; 
  pipeArgs?: any[];
}

// Nueva interfaz para estilos de fila
export interface TableRowStyle {
  condition: (rowData: any) => boolean;
  styleClass?: string;
  style?: { [key: string]: string };
}

export interface TableConfig {
  columns: TableColumn[];
  actions?: TableAction[];
  data: any[];
  loading?: boolean;
  paginator?: boolean;
  rows?: number;
  totalRecords?: number;
  lazy?: boolean;
  selectionMode?: 'single' | 'multiple';
  showGridlines?: boolean;
  responsive?: boolean;
  emptyMessage?: string;
  globalFilterFields?: string[];
  // Nuevas propiedades para estilos de fila
  rowStyles?: TableRowStyle[];
  rowStyleClass?: (rowData: any) => string;
  rowStyleFunction?: (rowData: any) => { [key: string]: string };
}

export interface TableEvents {
  onRowSelect?: (event: any) => void;
  onRowUnselect?: (event: any) => void;
  onSort?: (event: any) => void;
  onFilter?: (event: any) => void;
  onPage?: (event: any) => void;
  onLazyLoad?: (event: any) => void;
}