// report-viewer.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { ReportExportOptions } from '../models/report.interface';
import { FilterInfo } from 'src/app/proxy/shared/reports';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent
  ]
})
export class ReportViewerComponent {
  @ViewChild('reportContent', { static: false }) reportContent!: ElementRef;

  @Input() title = 'Reporte';
  @Input() reportHtml = '';
  @Input() appliedFilters: FilterInfo[] = [];
  @Input() loading = false;
  @Input() showExportButtons = true;
  @Input() exportOptions: ReportExportOptions = {
    showPrint: true,
    showExcel: true
  };

  @Output() printClick = new EventEmitter<void>();
  @Output() exportExcelClick = new EventEmitter<void>();

  onPrint(): void {
    this.printClick.emit();
  }

  onExportExcel(): void {
    this.exportExcelClick.emit();
  }

  get hasFilters(): boolean {
    return this.appliedFilters && this.appliedFilters.length > 0;
  }

  get filtersText(): string {
    if (!this.hasFilters) return '';
    return this.appliedFilters
      .map(filter => `${filter.name}: ${filter.displayValue}`)
      .join(' • ');
  }
}