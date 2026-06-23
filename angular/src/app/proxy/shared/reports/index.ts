export interface BaseReportParametersDto {
  fromDate?: string;
  toDate?: string;
  filter?: string;
}

export interface ReportMetadata {
  title: string;
  generatedBy: string;
  generatedAt: Date;
  filters: FilterInfo[];
}

export interface FilterInfo {
  name: string;
  value: any;
  displayValue: string;
}
