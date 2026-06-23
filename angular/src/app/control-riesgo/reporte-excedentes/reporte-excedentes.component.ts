import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { FormToolbarConfig, FormToolbarButton } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { ReportViewerComponent } from 'src/app/shared/components/reports/report-viewer/report-viewer.component';
import { BaseReportComponent, ReportSummaryItem } from 'src/app/shared/components/reports/base-report/base-report.component';
import { ReportMetadata, FilterInfo } from 'src/app/proxy/shared/reports';
import { ExcelExportService } from 'src/app/shared/components/reports/services/excel-export.service';
import { LoteriaService, SorteoService } from 'src/app/proxy/loterias';
import {
  ExcedentesAguanteService,
  ExcedentesAguanteReporteDto,
  ExcedentesAguanteItemDto
} from 'src/app/proxy/reportes/excedentes-aguante.service';

@Component({
  selector: 'app-reporte-excedentes-report',
  template: '',
  standalone: true,
  imports: [CommonModule]
})
class ExcedentesReportComponent extends BaseReportComponent<any, ExcedentesAguanteItemDto> {

  reporteData: ExcedentesAguanteReporteDto | null = null;

  constructor(injector: Injector) {
    super(injector);
  }

  generateViewerHTML(): string {
    if (!this.data || this.data.length === 0) return '';

    const rows = this.data.map((item, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.nombreLoteria}</td>
        <td>${item.nombreSorteo}</td>
        <td class="text-center fw-semibold" style="font-size: 1.1em">${String(item.numero).padStart(2, '0')}</td>
        <td class="align-right">${this.formatCurrency(item.limiteAguante)}</td>
        <td class="align-right">${this.formatCurrency(item.montoVendido)}</td>
        <td class="align-right fw-semibold" style="color: #dc3545">${this.formatCurrency(item.excedenteAguante)}</td>
        <td class="align-right">${this.formatCurrency(item.limiteVentaMaximo)}</td>
        <td class="align-right">${this.formatCurrency(item.disponible)}</td>
        <td class="text-center">
          <span class="badge ${item.porcentajeUso >= 100 ? 'badge-danger' : item.porcentajeUso >= 80 ? 'badge-warning' : 'badge-success'}"
                style="padding: 4px 8px; border-radius: 4px; font-size: 0.85em; ${item.porcentajeUso >= 100 ? 'background-color:#f8d7da;color:#842029;border:1px solid #f1aeb5;' : item.porcentajeUso >= 80 ? 'background-color:#fff3cd;color:#664d03;border:1px solid #ffda6a;' : 'background-color:#d1f2eb;color:#0f5132;border:1px solid #a3e3d1;'}">
            ${item.porcentajeUso.toFixed(1)}%
          </span>
        </td>
      </tr>
    `).join('');

    const totalExcedente = this.data.reduce((sum, i) => sum + i.excedenteAguante, 0);

    return `
      <div class="modern-table">
        <table>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Loteria</th>
              <th>Sorteo</th>
              <th class="text-center">Numero</th>
              <th class="align-right">Aguante</th>
              <th class="align-right">Vendido</th>
              <th class="align-right">Excedente</th>
              <th class="align-right">Limite Max.</th>
              <th class="align-right">Disponible</th>
              <th class="text-center">% Uso</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td colspan="6" style="text-align: right; padding: 12px 8px;">Total Excedente:</td>
              <td class="align-right" style="color: #dc3545; padding: 12px 8px;">${this.formatCurrency(totalExcedente)}</td>
              <td colspan="3" style="text-align: center; padding: 12px 8px;">${this.data.length} numeros</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  generatePrintHTML(): string {
    if (!this.data || this.data.length === 0) return '<tbody><tr><td colspan="10">Sin datos</td></tr></tbody>';

    const rows = this.data.map((item, index) => `
      <tr>
        <td style="text-align:center;">${index + 1}</td>
        <td>${item.nombreLoteria}</td>
        <td>${item.nombreSorteo}</td>
        <td style="text-align:center;font-weight:bold;">${String(item.numero).padStart(2, '0')}</td>
        <td style="text-align:right;">${this.formatCurrency(item.limiteAguante)}</td>
        <td style="text-align:right;">${this.formatCurrency(item.montoVendido)}</td>
        <td style="text-align:right;font-weight:bold;">${this.formatCurrency(item.excedenteAguante)}</td>
        <td style="text-align:right;">${this.formatCurrency(item.limiteVentaMaximo)}</td>
        <td style="text-align:right;">${this.formatCurrency(item.disponible)}</td>
        <td style="text-align:center;">${item.porcentajeUso.toFixed(1)}%</td>
      </tr>
    `).join('');

    const totalExcedente = this.data.reduce((sum, i) => sum + i.excedenteAguante, 0);

    return `
      <tbody>
        ${rows}
        <tr style="font-weight:bold;background-color:#f0f0f0;">
          <td colspan="6" style="text-align:right;">Total Excedente:</td>
          <td style="text-align:right;">${this.formatCurrency(totalExcedente)}</td>
          <td colspan="3" style="text-align:center;">${this.data.length} numeros</td>
        </tr>
      </tbody>
    `;
  }

  getTableHeaders(): string[] {
    return ['#', 'Loteria', 'Sorteo', 'Numero', 'Aguante', 'Vendido', 'Excedente', 'Limite Max.', 'Disponible', '% Uso'];
  }

  getExcelData(): any[] {
    return this.data.map((item, index) => ({
      '#': index + 1,
      'Loteria': item.nombreLoteria,
      'Sorteo': item.nombreSorteo,
      'Numero': String(item.numero).padStart(2, '0'),
      'Aguante': item.limiteAguante,
      'Vendido': item.montoVendido,
      'Excedente': item.excedenteAguante,
      'Limite Max.': item.limiteVentaMaximo,
      'Disponible': item.disponible,
      '% Uso': item.porcentajeUso.toFixed(1) + '%'
    }));
  }

  getExcelHeaders(): string[] {
    return this.getTableHeaders();
  }

  getSummaryItems(): ReportSummaryItem[] {
    const totalExcedente = this.data.reduce((sum, i) => sum + i.excedenteAguante, 0);
    return [
      { label: 'Total Excedente', value: this.formatCurrency(totalExcedente), type: 'danger' },
      { label: 'Total Numeros', value: this.data.length, type: 'primary' }
    ];
  }
}

@Component({
  selector: 'app-reporte-excedentes',
  templateUrl: './reporte-excedentes.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormToolbarComponent,
    InputComponent,
    SelectComponent,
    ReportViewerComponent
  ]
})
export class ReporteExcedentesComponent implements OnInit {
  filterForm!: FormGroup;
  isLoading = false;
  reporteData: ExcedentesAguanteReporteDto | null = null;
  reportHtml = '';
  appliedFilters: FilterInfo[] = [];

  metadata: ReportMetadata = {
    title: 'Reporte de Excedentes de Aguante',
    generatedBy: '',
    generatedAt: new Date(),
    filters: []
  };

  formToolbarConfig: FormToolbarConfig = {
    title: 'Reporte de Excedentes de Aguante',
    subtitle: 'Numeros que excedieron su limite de aguante',
    showSaveButton: false,
    showCancelButton: false,
    sticky: true,
    buttons: [
      {
        id: 'generate',
        label: 'Generar Reporte',
        icon: 'fas fa-file-alt',
        variant: 'primary',
        order: 1
      } as FormToolbarButton
    ]
  };

  private reportComponent: ExcedentesReportComponent;

  constructor(
    private fb: FormBuilder,
    private injector: Injector,
    private excedentesService: ExcedentesAguanteService,
    private excelExportService: ExcelExportService,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService
  ) {
    this.reportComponent = new ExcedentesReportComponent(injector);
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      loteriaId: [''],
      sorteoId: [''],
      fecha: [new Date().toISOString().split('T')[0]]
    });
  }

  private toIsoDate(val: any): string {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return String(val).split('T')[0];
  }

  generarReporte(): void {
    const fecha = this.toIsoDate(this.filterForm.get('fecha')?.value);
    if (!fecha) return;

    this.isLoading = true;
    this.reporteData = null;
    this.reportHtml = '';

    const params = {
      loteriaId: this.filterForm.get('loteriaId')?.value || undefined,
      sorteoId: this.filterForm.get('sorteoId')?.value || undefined,
      fecha: fecha
    };

    this.excedentesService.generar(params).subscribe({
      next: (data) => {
        this.reporteData = data;

        // Build filters
        this.appliedFilters = [
          { name: 'Fecha', value: fecha, displayValue: this.formatDateDisplay(fecha) },
          { name: 'Loteria', value: data.filtroLoteria, displayValue: data.filtroLoteria },
          { name: 'Sorteo', value: data.filtroSorteo, displayValue: data.filtroSorteo }
        ];

        this.metadata = {
          title: 'Reporte de Excedentes de Aguante',
          generatedBy: 'Admin',
          generatedAt: new Date(),
          filters: this.appliedFilters
        };

        // Generate report HTML
        this.reportComponent.data = data.items;
        this.reportComponent.metadata = this.metadata;
        this.reportHtml = this.reportComponent.generateViewerHTML();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.isLoading = false;
      }
    });
  }

  onPrint(): void {
    if (!this.reporteData) return;

    this.reportComponent.data = this.reporteData.items;
    this.reportComponent.metadata = this.metadata;

    const printHtml = this.reportComponent.generateFullPrintHTML('landscape');
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }

  onExportExcel(): void {
    if (!this.reporteData) return;

    this.reportComponent.data = this.reporteData.items;

    this.excelExportService.exportToExcel({
      fileName: 'excedentes_aguante',
      sheetName: 'Excedentes',
      reportTitle: 'Reporte de Excedentes de Aguante',
      headers: this.reportComponent.getExcelHeaders(),
      data: this.reportComponent.getExcelData(),
      includeFilters: true,
      filters: this.appliedFilters.map(f => ({ name: f.name, value: f.displayValue })),
      generatedBy: 'Admin',
      generatedAt: new Date()
    });
  }

  private formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
