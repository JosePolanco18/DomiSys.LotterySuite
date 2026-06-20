import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  headers?: string[];
  data: any[];
  includeFilters?: boolean;
  filters?: { name: string; value: string }[];
  reportTitle?: string;
  generatedBy?: string;
  generatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportToExcel(options: ExcelExportOptions): void {
    const {
      fileName = 'reporte',
      sheetName = 'Datos',
      headers = [],
      data = [],
      includeFilters = true,
      filters = [],
      reportTitle = 'Reporte',
      generatedBy = 'Usuario',
      generatedAt = new Date()
    } = options;

    const workbook = XLSX.utils.book_new();
    
    const worksheetData = this.prepareWorksheetData({
      reportTitle,
      generatedBy,
      generatedAt,
      filters: includeFilters ? filters : [],
      headers,
      data
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    this.applyWorksheetStyles(worksheet, worksheetData, headers);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const timestamp = this.formatTimestamp(generatedAt);
    const finalFileName = `${fileName}_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, finalFileName);
  }

  private prepareWorksheetData(config: {
    reportTitle: string;
    generatedBy: string;
    generatedAt: Date;
    filters: { name: string; value: string }[];
    headers: string[];
    data: any[];
  }): any[][] {
    const { reportTitle, generatedBy, generatedAt, filters, headers, data } = config;
    const worksheetData: any[][] = [];
    
    worksheetData.push([reportTitle]);
    worksheetData.push([]);
    
    worksheetData.push(['Generado por:', generatedBy]);
    worksheetData.push(['Fecha de generación:', this.formatDateTime(generatedAt)]);
    worksheetData.push([]);
    
    if (filters.length > 0) {
      worksheetData.push(['Filtros aplicados:']);
      filters.forEach(filter => {
        worksheetData.push([`  ${filter.name}:`, filter.value]);
      });
      worksheetData.push([]);
    }
    
    if (headers.length > 0) {
      worksheetData.push(headers);
    }
    
    if (data.length > 0) {
      if (headers.length > 0) {
        data.forEach(row => {
          const rowData = headers.map(header => row[header] || '');
          worksheetData.push(rowData);
        });
      } else {
        data.forEach(row => {
          if (Array.isArray(row)) {
            worksheetData.push(row);
          } else {
            worksheetData.push(Object.values(row));
          }
        });
      }
    }
    
    return worksheetData;
  }

  private applyWorksheetStyles(worksheet: XLSX.WorkSheet, worksheetData: any[][], headers: string[]): void {
    const headerColumns = headers.length;
    const columnWidths = Array(headerColumns).fill({ wch: 15 });
    worksheet['!cols'] = columnWidths;
    
    let headerRowIndex = -1;
    for (let rowIndex = 0; rowIndex < worksheetData.length; rowIndex++) {
      const row = worksheetData[rowIndex];
      if (row.length === headerColumns && headerColumns > 1) {
        let isHeaderRow = true;
        for (let i = 0; i < headerColumns; i++) {
          if (!headers.includes(row[i])) {
            isHeaderRow = false;
            break;
          }
        }
        if (isHeaderRow) {
          headerRowIndex = rowIndex;
          break;
        }
      }
    }
    
    if (headerRowIndex >= 0) {
      for (let colIndex = 0; colIndex < headerColumns; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          font: { bold: true }
        };
      }
    }
    
    this.applyGroupStyles(worksheet, worksheetData, headerRowIndex, headerColumns);
  }

  private applyGroupStyles(worksheet: XLSX.WorkSheet, worksheetData: any[][], headerRowIndex: number, headerColumns: number): void {
    if (headerRowIndex < 0) return;
    
    const merges = [];
    
    for (let rowIndex = headerRowIndex + 1; rowIndex < worksheetData.length; rowIndex++) {
      const row = worksheetData[rowIndex];
      
      if (row.length >= 2 && row[1] === '___GROUP_HEADER___') {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        
        merges.push({
          s: { r: rowIndex, c: 0 },
          e: { r: rowIndex, c: headerColumns - 1 }
        });
        
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
        
        for (let colIndex = 1; colIndex < headerColumns; colIndex++) {
          const mergeCellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          worksheet[mergeCellAddress] = { v: '', s: {
            font: { bold: true, sz: 12 }
          }};
        }
      }
      
      if (row.length >= 2 && row[1] === '___GROUP_TOTAL___') {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
        
        merges.push({
          s: { r: rowIndex, c: 0 },
          e: { r: rowIndex, c: headerColumns - 1 }
        });
        
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, italic: true, sz: 11 },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
        
        for (let colIndex = 1; colIndex < headerColumns; colIndex++) {
          const mergeCellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          worksheet[mergeCellAddress] = { v: '', s: {
            font: { bold: true, italic: true, sz: 11 }
          }};
        }
      }
    }
    
    if (merges.length > 0) {
      worksheet['!merges'] = merges;
    }
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatTimestamp(date: Date): string {
    return date.toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .slice(0, 19);
  }

  exportSimpleData(data: any[], fileName: string = 'datos', headers?: string[]): void {
    this.exportToExcel({
      fileName,
      data,
      headers,
      includeFilters: false
    });
  }
}