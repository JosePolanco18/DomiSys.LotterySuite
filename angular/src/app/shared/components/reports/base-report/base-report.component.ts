import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseReportParametersDto, ReportMetadata, FilterInfo } from 'src/app/proxy/shared/reports';
import { CompanySettingsService, CompanyFileService } from 'src/app/proxy/settings';
import { ReportExportOptions } from '../models/report.interface';

export interface ReportSummaryItem {
  label: string;
  value: number | string;
  type?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  rnc: string;
  logoBase64: string;
}

@Component({
  selector: 'app-base-report',
  template: '',
  standalone: true,
  imports: [CommonModule]
})
export abstract class BaseReportComponent<TParams extends BaseReportParametersDto, TData> implements OnInit {
  @ViewChild('reportContent', { static: false }) reportContent!: ElementRef;

  @Input() data: TData[] = [];
  @Input() parameters!: TParams;
  @Input() metadata!: ReportMetadata;
  @Input() loading = false;
  @Input() exportOptions: ReportExportOptions = {
    showPrint: true,
    showExcel: true
  };
  @Input() showSummarySection = true;

  @Output() exportToExcel = new EventEmitter<void>();
  @Output() printReport = new EventEmitter<void>();

  protected companyInfo: CompanyInfo = {
    name: '',
    address: '',
    city: '',
    phone: '',
    rnc: '',
    logoBase64: ''
  };

  protected companyInfoLoaded = false;

  private companySettingsService!: CompanySettingsService;
  private companyFileService!: CompanyFileService;

  constructor(protected injector: Injector) {
    this.companySettingsService = this.injector.get(CompanySettingsService);
    this.companyFileService = this.injector.get(CompanyFileService);
  }

  ngOnInit(): void {
    this.loadCompanyInfo();
  }

  private loadCompanyInfo(): void {
    const companySettings$ = this.companySettingsService.get().pipe(
      catchError(error => {
        console.error('Error loading company settings:', error);
        return of(null);
      })
    );

    const logoBase64$ = this.companyFileService.getLogoBase64().pipe(
      catchError(error => {
        console.error('Error loading company logo:', error);
        return of('');
      })
    );

    forkJoin({
      settings: companySettings$,
      logo: logoBase64$
    }).subscribe({
      next: (result) => {
        if (result.settings) {
          this.companyInfo = {
            name: result.settings.name || 'EMPRESA',
            address: result.settings.address || '',
            city: '',
            phone: result.settings.phones || '',
            rnc: result.settings.rnc ? `RNC: ${result.settings.rnc}` : '',
            logoBase64: result.logo ? `data:image/png;base64,${result.logo}` : this.getDefaultLogo()
          };
        } else {
          this.setDefaultCompanyInfo();
        }
        this.companyInfoLoaded = true;
      },
      error: (error) => {
        console.error('Error loading company information:', error);
        this.setDefaultCompanyInfo();
        this.companyInfoLoaded = true;
      }
    });
  }

  private setDefaultCompanyInfo(): void {
    this.companyInfo = {
      name: 'DOMISYS FINANCIAL SUITE',
      address: 'Av. 27 de Febrero, Plaza Comercial La Fuente, Local 201-A, Santiago de los Caballeros, República Dominicana',
      city: '',
      phone: 'Teléfono: (809) 555-0123',
      rnc: 'RNC: 131234567',
      logoBase64: this.getDefaultLogo()
    };
  }

  private getDefaultLogo(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY1NzIyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRTPC90ZXh0Pgo8L3N2Zz4K';
  }

  public refreshCompanyInfo(): void {
    this.companyInfoLoaded = false;
    this.loadCompanyInfo();
  }

  abstract generateViewerHTML(): string;
  abstract generatePrintHTML(): string;
  abstract getExcelData(): any[];
  abstract getExcelHeaders(): string[];
  abstract getSummaryItems(): ReportSummaryItem[];

  onExportToExcel(): void {
    this.exportToExcel.emit();
  }

  onPrintReport(): void {
    this.printReport.emit();
  }

  private generateAppliedFilters(): string {
    if (!this.appliedFilters.length) return '';

    const filtersText = this.appliedFilters
      .map(filter => `${filter.name}: ${filter.displayValue}`)
      .join(' | ');

    return `
      <div class="report-filters">
        <div class="filters-text">${filtersText}</div>
      </div>
    `;
  }

  private generateSummaryText(): string {

    if (!this.showSummarySection) {
      return '';
    }

    const summaryItems = this.getSummaryItems();
    if (!summaryItems.length) return '';

    const totalItem = summaryItems.find(item => item.label.toLowerCase().includes('total'));
    const activeItem = summaryItems.find(item => item.label.toLowerCase().includes('activ'));
    const inactiveItem = summaryItems.find(item => item.label.toLowerCase().includes('inactiv'));

    if (!totalItem) return '';

    let summaryText = `Total: ${totalItem.value} registros`;
    
    if (activeItem) {
      summaryText += `, activos ${activeItem.value}`;
    }
    
    if (inactiveItem) {
      summaryText += `, inactivos ${inactiveItem.value}`;
    }

    return `
      <div class="report-summary-text">
        ${summaryText}
      </div>
    `;
  }

  private getPrintStyles(orientation: 'portrait' | 'landscape' = 'portrait'): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, sans-serif;
        line-height: 1.4;
        color: #000;
        background: white;
        padding: 5px;
      }
      
      .report-container {
        margin: 0;
        padding-top: 0px;
        padding-bottom: 5px;
        padding-left: 0;
        padding-right: 0;
      }
      
      .company-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0px;
        margin-bottom: 0px;
      }
      
      .company-section {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex: 1;
      }
      
      .company-logo {
        height: 45px;
        margin-bottom: 5px;
        margin-top: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .logo-img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }
      
      .company-details {
        flex: 1;
        margin-top: 0px;
      }
      
      .company-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 2px;
        color: #000;
        line-height: 1.2;
      }
      
      .company-address,
      .company-contact {
        font-size: 10px;
        color: #333;
        margin-bottom: 1px;
        line-height: 1.3;
      }
      
      .report-metadata {
        margin-left: auto;
        margin-top: 0px;
      }
      
      .metadata-table {
        font-size: 9px;
        color: #333;
        border-collapse: collapse;
      }
      
      .metadata-table td {
        border: none !important;
        padding: 0px 0;
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: initial !important;
        max-width: none !important;
        line-height: 1.1;
      }
      
      .metadata-table td:first-child {
        text-align: left;
        padding-right: 6px;
        font-weight: bold;
      }
      
      .metadata-table td:last-child {
        text-align: left;
      }
      
      .report-title-section {
        text-align: center;
        margin-top: 0px;
        margin-bottom: 6px;
        border-bottom: 1px dotted #999;
        padding-top: 0px;
        padding-bottom: 4px;
      }
      
      .report-title {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        color: #000;
      }
      
      .report-filters {
        background-color: #f8f8f8;
        padding: 4px 6px;
        margin-bottom: 6px;
        border-radius: 3px;
        border: 1px solid #ddd;
        text-align: center;
      }
      
      .filters-text {
        font-size: 10px;
        color: #333;
        font-style: italic;
        text-align: center;
        display: block;
      }
      
      .report-summary-text {
        text-align: left;
        margin: 8px 0;
        padding: 4px 8px;
        font-size: 11px;
        color: #333;
        font-style: italic;
        background-color: #f9f9f9;
        border-radius: 3px;
      }
      
      .report-table {
        width: 100%;
        border-collapse: collapse;
        margin: 5px 0;
        font-size: ${orientation === 'landscape' ? '10px' : '11px'};
      }
      
      .corporate-header-cell {
        border: none !important;
        padding: 0 !important;
      }
      
      .report-table th {
        background-color: #f8f9fa;
        font-weight: bold;
        padding: ${orientation === 'landscape' ? '3px 2px' : '4px 3px'};
        text-align: left;
        font-size: ${orientation === 'landscape' ? '9px' : '10px'};
        color: #000;
        white-space: nowrap;
      }
      
      .report-table tbody td {
        padding: ${orientation === 'landscape' ? '2px' : '3px'};
        border-bottom: 1px dotted #ccc;
        color: #000;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: ${orientation === 'landscape' ? '120px' : '150px'};
      }
      
      .print-group-section td {
        page-break-inside: avoid;
      }
      
      .print-group-title {
        font-size: 10px;
        font-weight: bold;
        padding: 3px 6px !important;
        background-color: #f0f0f0 !important;
        border: 1px solid #ccc !important;
        text-transform: uppercase;
        text-align: left !important;
      }
      
      .print-group-total {
        text-align: left !important;
        font-size: 10px;
        font-style: italic;
        color: #333;
        padding: 3px 6px !important;
        background-color: #f9f9f9 !important;
      }
      
      .fw-semibold {
        font-weight: 600;
      }
      
      .text-muted {
        color: #666;
      }
      
      .no-data {
        text-align: center;
        padding: 40px;
        font-size: 14px;
        color: #666;
      }
      
      @page {
        margin: 0.5cm;
        size: A4 ${orientation};
        
        @bottom-center {
          content: "Página " counter(page) " de " counter(pages);
          font-size: 9px;
          color: #666;
          margin-top: 5px;
        }
      }
      
      body {
        counter-reset: page;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .report-table thead {
        display: table-header-group;
      }
      
      .report-table tbody tr {
        page-break-inside: avoid;
      }
    `;
  }

  generateFullPrintHTML(orientation: 'portrait' | 'landscape' = 'portrait'): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${this.metadata?.title || 'Reporte'}</title>
        <style>
          ${this.getPrintStyles(orientation)}
        </style>
      </head>
      <body>
        <div class="report-container">
          ${this.generateUnifiedPrintTable()}
          ${this.generateSummaryText()}
        </div>
      </body>
      </html>
    `;
  }

  protected generateUnifiedPrintTable(): string {
    const tableHeaders = this.getTableHeaders();
    const filtersHtml = this.generateAppliedFiltersContent();
    const colspan = tableHeaders.length;
    
    return `
      <table class="report-table">
        <thead>
          <tr class="corporate-header-row">
            <td colspan="${colspan}" class="corporate-header-cell">
              <div class="company-info">
                <div class="company-section">
                  <div class="company-logo">
                    <img src="${this.companyInfo.logoBase64}" alt="Logo" class="logo-img">
                  </div>
                  <div class="company-details">
                    <h1 class="company-name">${this.companyInfo.name}</h1>
                    <div class="company-address">${this.companyInfo.address}</div>
                    <div class="company-contact">${this.companyInfo.phone}${this.companyInfo.rnc ? ' | ' + this.companyInfo.rnc : ''}</div>
                  </div>
                </div>
                <div class="report-metadata">
                  <table class="metadata-table">
                    <tr><td>Usuario:</td><td>${this.metadata?.generatedBy || 'admin'}</td></tr>
                    <tr><td>Fecha:</td><td>${this.formatDate(new Date())}</td></tr>
                    <tr><td>Hora:</td><td>${this.formatTime(new Date())}</td></tr>
                  </table>
                </div>
              </div>
              <div class="report-title-section">
                <h2 class="report-title">${this.metadata?.title || ''}</h2>
              </div>
              ${filtersHtml}
            </td>
          </tr>
          <tr class="table-headers-row">
            ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        ${this.generatePrintHTML()}
      </table>
    `;
  }

  protected abstract getTableHeaders(): string[];

  private generateAppliedFiltersContent(): string {
    if (!this.appliedFilters.length) return '';

    const filtersText = this.appliedFilters
      .map(filter => `${filter.name}: ${filter.displayValue}`)
      .join(' | ');

    return `
      <div class="report-filters">
        <div class="filters-text">${filtersText}</div>
      </div>
    `;
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatDateTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  }

  formatNumber(num: number): string {
    if (num === null || num === undefined) return '';
    return new Intl.NumberFormat('es-DO').format(num);
  }

  get hasData(): boolean {
    return this.data && this.data.length > 0;
  }

  get appliedFilters(): FilterInfo[] {
    return this.metadata?.filters || [];
  }

  get reportTitle(): string {
    return this.metadata?.title || '';
  }

  get generatedInfo(): string {
    if (!this.metadata) return '';
    const date = this.formatDateTime(this.metadata.generatedAt);
    return `Generado por ${this.metadata.generatedBy} el ${date}`;
  }

  get isCompanyInfoReady(): boolean {
    return this.companyInfoLoaded;
  }

  protected addPageBreak(): string {
    return '<div class="page-break"></div>';
  }

  protected wrapInPageSection(content: string, allowPageBreak: boolean = true): string {
    const pageBreakClass = allowPageBreak ? '' : ' style="page-break-inside: avoid;"';
    return `<div${pageBreakClass}>${content}</div>`;
  }
}