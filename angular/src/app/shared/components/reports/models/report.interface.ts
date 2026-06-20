export interface ReportParametersConfig {
  title: string;
  fields: ReportFieldConfig[];
  submitButtonLabel?: string;
  resetButtonLabel?: string;
}

export interface ReportFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'dateRange' | 'number' | 'currency';
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
  service?: any;
  bindValue?: string;
  bindLabel?: string;
  bindCode?: string;
  options?: { value: any; label: string, identifier?: string }[];
  defaultValue?: any;
}

export interface ReportExportOptions {
  showPrint?: boolean;
  showExcel?: boolean;
  excelOptions?: {
    fileName?: string;
    sheetName?: string;
    includeFilters?: boolean;
  };
}

export interface ReportToolbarConfig {
  title?: string;
  subtitle?: string;
  generateButtonLabel?: string;
  resetButtonLabel?: string;
  exitButtonLabel?: string;
  showBackButton?: boolean;
}