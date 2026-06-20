import { Component, Input, OnInit, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompanySettingsService, CompanyFileService } from 'src/app/proxy/settings';

export type ReceiptFormat = 'ROLL' | 'HALF_PAGE' | 'QUARTER_PAGE';

export interface ReceiptConfig {
  format: ReceiptFormat;
  showLogo?: boolean;
  directPrint?: boolean;
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
  selector: 'app-base-receipt',
  template: `
    <div *ngIf="loading && isDirectPrintMode" class="direct-print-loading">
      <div class="text-center p-4">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Preparando impresión...</div>
      </div>
    </div>

    <div *ngIf="loading && !isDirectPrintMode" class="d-flex justify-content-center align-items-center" style="height: 200px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Generando recibo...</span>
      </div>
    </div>

    <div *ngIf="!loading && !hasData && !isDirectPrintMode" class="text-center p-4">
      <i class="ki-outline ki-file-deleted text-muted fs-1"></i>
      <div class="mt-2 text-muted">No se encontraron datos para el recibo</div>
    </div>

    <div *ngIf="!loading && hasData && !isDirectPrintMode" 
         class="receipt-preview-content"
         [innerHTML]="receiptHtml">
    </div>

    <div *ngIf="isDirectPrintMode" class="d-none"></div>
  `,
  styles: [`
    .direct-print-loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
    }

    .receipt-preview-content {
      font-family: 'Courier New', monospace;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .receipt-preview-content .company-header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 1px dashed #000;
      padding-bottom: 10px;
    }

    .receipt-preview-content .company-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .receipt-preview-content .transaction-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 12px;
    }

    .receipt-preview-content .transaction-title {
      text-align: center;
      font-weight: bold;
      margin: 15px 0;
      padding: 8px;
      border: 1px solid #000;
      text-transform: uppercase;
    }

    .receipt-preview-content .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 12px;
    }

    .receipt-preview-content .signature-section {
      text-align: center;
      margin-top: 20px;
    }

    .receipt-preview-content .signature-line {
      border-top: 1px solid #000;
      width: 60%;
      margin: 25px auto 8px auto;
    }

    .receipt-preview-content .footer-note {
      text-align: center;
      font-size: 11px;
      font-style: italic;
      margin-top: 15px;
      border-top: 1px dashed #000;
      padding-top: 10px;
    }

    @media print {
      .receipt-preview-content {
        border: none;
        box-shadow: none;
        margin: 0;
        padding: 0;
      }
      
      .direct-print-loading {
        display: none !important;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export abstract class BaseReceiptComponent implements OnInit, OnDestroy {

  @Input() loading = false;
  @Input() receiptConfig: ReceiptConfig = {
    format: 'ROLL',
    showLogo: false,
    directPrint: false
  };

  protected receiptHtml: string = '';
  protected isDirectPrintMode: boolean = false;
  protected companyInfoLoaded = false;
  protected receiptId: string = '';
  
  protected companyInfo: CompanyInfo = {
    name: '',
    address: '',
    city: '',
    phone: '',
    rnc: '',
    logoBase64: ''
  };

  private printTimeout: any; 
  private windowCloseTimeout: any;

  private companySettingsService!: CompanySettingsService;
  private companyFileService!: CompanyFileService;

  constructor(
    protected injector: Injector,
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    this.companySettingsService = this.injector.get(CompanySettingsService);
    this.companyFileService = this.injector.get(CompanyFileService);
  }

  ngOnInit(): void {
    this.initializeReceipt();
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  private initializeReceipt(): void {
    this.route.params.subscribe(params => {
      this.receiptId = params['transactionId'] || params['id'] || params['receiptId'];
      
      this.route.queryParams.subscribe(queryParams => {
        this.isDirectPrintMode = queryParams['directPrint'] === 'true' || queryParams['printDirect'] === 'true';
        this.loadCompanyInfoAndGenerate();
      });
    });
  }

  private loadCompanyInfoAndGenerate(): void {
    this.loading = true;
    
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

          if (result.settings.receiptPrintSize) {
            this.receiptConfig.format = result.settings.receiptPrintSize as ReceiptFormat;
          }
        } else {
          this.setDefaultCompanyInfo();
        }
        
        this.companyInfoLoaded = true;
        this.generateReceiptData();
      },
      error: (error) => {
        console.error('Error loading company information:', error);
        this.setDefaultCompanyInfo();
        this.companyInfoLoaded = true;
        this.generateReceiptData();
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

  protected abstract generateReceiptData(): void;
  protected abstract generateReceiptContent(): string;
  protected abstract get hasData(): boolean;

  public generateReceiptHTML(): string {
    switch (this.receiptConfig.format) {
      case 'ROLL':
        return this.generateRollReceiptHTML();
      case 'HALF_PAGE':
        return this.generateHalfPageReceiptHTML();
      case 'QUARTER_PAGE':
        return this.generateQuarterPageReceiptHTML();
      default:
        return this.generateRollReceiptHTML();
    }
  }

  private generateRollReceiptHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo</title>
        <style>
          ${this.getRollReceiptStyles()}
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${this.generateReceiptContent()}
        </div>
      </body>
      </html>
    `;
  }

  private getRollReceiptStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Courier New', monospace;
        line-height: 1.3;
        color: #000;
        background: white;
        padding: 0;
        margin: 0;
        width: 80mm;
        font-size: 15px;
      }

      .receipt-container {
        width: 100%;
        padding: 6px 8px;
        max-width: 80mm;
      }

      .company-header {
        text-align: center;
        margin-bottom: 8px;
        border-bottom: 1px dashed #000;
        padding-bottom: 6px;
      }

      .company-name {
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 2px;
        line-height: 1.1;
      }

      .company-address {
        font-size: 13px;
        margin-bottom: 1px;
        line-height: 1.1;
      }

      .company-contact {
        font-size: 13px;
        margin-bottom: 2px;
      }

      .transaction-header {
        margin-bottom: 8px;
        border-bottom: 1px dashed #000;
        padding-bottom: 6px;
      }

      .transaction-info {
        display: block;
        margin-bottom: 2px;
        font-size: 14px;
      }

      .transaction-label {
        display: inline-block;
        width: 45%;
        font-weight: normal;
      }

      .transaction-value {
        display: inline-block;
        width: 54%;
        text-align: right;
        font-weight: bold;
      }

      .transaction-title {
        text-align: center;
        font-size: 15px;
        font-weight: bold;
        margin: 8px 0;
        text-transform: uppercase;
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        padding: 4px 0;
      }

      .transaction-details {
        margin-bottom: 8px;
        border-bottom: 1px dashed #000;
        padding-bottom: 6px;
      }

      .detail-row {
        margin-bottom: 3px;
        font-size: 14px;
      }

      .detail-label {
        font-weight: normal;
        margin-bottom: 1px;
      }

      .detail-value {
        font-weight: bold;
        margin-bottom: 2px;
      }

      .amounts-section {
        margin-bottom: 8px;
        border-bottom: 1px dashed #000;
        padding-bottom: 6px;
      }

      .amount-row {
        display: block;
        margin-bottom: 2px;
        font-size: 14px;
      }

      .amount-label {
        display: inline-block;
        width: 60%;
        font-weight: normal;
      }

      .amount-value {
        display: inline-block;
        width: 39%;
        text-align: right;
        font-weight: bold;
      }

      .attendant-section {
        text-align: center;
        margin: 12px 0;
        border-bottom: 1px dashed #000;
        padding-bottom: 8px;
      }

      .attendant-text {
        font-size: 13px;
        font-weight: normal;
        margin-bottom: 2px;
      }

      .attendant-name {
        font-size: 14px;
        font-weight: bold;
      }

      .signature-section {
        text-align: center;
        margin-top: 12px;
        margin-bottom: 8px;
      }

      .signature-line {
        border-top: 1px solid #000;
        width: 60%;
        margin: 20px auto 6px auto;
      }

      .signature-label {
        font-size: 13px;
        font-weight: bold;
      }

      .footer-note {
        text-align: center;
        font-size: 12px;
        font-style: italic;
        margin-top: 8px;
        border-top: 1px dashed #000;
        padding-top: 6px;
      }
      
      @page {
        margin: 0;
        size: 80mm auto;
      }
      
      @media print {
        body {
          width: 80mm;
        }
        
        .receipt-container {
          width: 80mm;
        }
      }
    `;
  }

  private generateHalfPageReceiptHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo</title>
        <style>
          ${this.getHalfPageReceiptStyles()}
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${this.generateReceiptContent()}
        </div>
      </body>
      </html>
    `;
  }

  private getHalfPageReceiptStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Courier New', monospace;
        line-height: 1.3;
        color: #000;
        background: white;
        padding: 8px;
        margin: 0;
        font-size: 13px;
      }
      
      .receipt-container {
        width: 100%;
        max-width: 210mm;
        height: 148.5mm;
        padding: 10px;
        border: 1px solid #000;
        margin: 0 auto;
      }
      
      .company-header {
        text-align: center;
        margin-bottom: 12px;
        border-bottom: 1px solid #000;
        padding-bottom: 8px;
      }
      
      .company-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 3px;
        line-height: 1.2;
      }
      
      .company-address {
        font-size: 11px;
        margin-bottom: 2px;
        line-height: 1.2;
      }
      
      .company-contact {
        font-size: 11px;
        margin-bottom: 3px;
      }
      
      .transaction-header {
        margin-bottom: 12px;
        border-bottom: 1px dotted #000;
        padding-bottom: 8px;
      }
      
      .transaction-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        font-size: 12px;
      }
      
      .transaction-label {
        font-weight: normal;
      }
      
      .transaction-value {
        font-weight: bold;
      }
      
      .transaction-title {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        margin: 12px 0;
        text-transform: uppercase;
        border: 1px solid #000;
        padding: 6px 0;
      }
      
      .transaction-details {
        margin-bottom: 12px;
        border-bottom: 1px dotted #000;
        padding-bottom: 8px;
      }
      
      .detail-row {
        margin-bottom: 4px;
        font-size: 12px;
      }
      
      .detail-label {
        font-weight: normal;
        margin-bottom: 2px;
      }
      
      .detail-value {
        font-weight: bold;
        margin-bottom: 3px;
      }
      
      .amounts-section {
        margin-bottom: 12px;
        border-bottom: 1px dotted #000;
        padding-bottom: 8px;
      }
      
      .amount-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        font-size: 12px;
      }
      
      .amount-label {
        font-weight: normal;
      }
      
      .amount-value {
        font-weight: bold;
      }
      
      .attendant-section {
        text-align: center;
        margin: 15px 0;
        border-bottom: 1px dotted #000;
        padding-bottom: 10px;
      }
      
      .attendant-text {
        font-size: 11px;
        font-weight: normal;
        margin-bottom: 3px;
      }
      
      .attendant-name {
        font-size: 12px;
        font-weight: bold;
      }
      
      .signature-section {
        text-align: center;
        margin-top: 15px;
        margin-bottom: 10px;
      }
      
      .signature-line {
        border-top: 1px solid #000;
        width: 50%;
        margin: 25px auto 8px auto;
      }
      
      .signature-label {
        font-size: 11px;
        font-weight: bold;
      }
      
      .footer-note {
        text-align: center;
        font-size: 10px;
        font-style: italic;
        margin-top: 10px;
        border-top: 1px dotted #000;
        padding-top: 8px;
      }
      
      @page {
        margin: 5mm;
        size: A4 portrait;
      }
      
      @media print {
        .receipt-container {
          border: none;
          height: auto;
        }
      }
    `;
  }

  private generateQuarterPageReceiptHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo</title>
        <style>
          ${this.getQuarterPageReceiptStyles()}
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${this.generateReceiptContent()}
        </div>
      </body>
      </html>
    `;
  }

  private getQuarterPageReceiptStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Courier New', monospace;
        line-height: 1.2;
        color: #000;
        background: white;
        padding: 5px;
        margin: 0;
        font-size: 11px;
      }
      
      .receipt-container {
        width: 100%;
        max-width: 105mm;
        height: 148.5mm;
        padding: 8px;
        border: 1px solid #000;
        margin: 0 auto;
      }
      
      .company-header {
        text-align: center;
        margin-bottom: 8px;
        border-bottom: 1px solid #000;
        padding-bottom: 6px;
      }
      
      .company-name {
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 2px;
        line-height: 1.1;
      }
      
      .company-address {
        font-size: 9px;
        margin-bottom: 1px;
        line-height: 1.1;
      }
      
      .company-contact {
        font-size: 9px;
        margin-bottom: 2px;
      }
      
      .transaction-header {
        margin-bottom: 8px;
        border-bottom: 1px dotted #000;
        padding-bottom: 6px;
      }
      
      .transaction-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 10px;
      }
      
      .transaction-label {
        font-weight: normal;
      }
      
      .transaction-value {
        font-weight: bold;
      }
      
      .transaction-title {
        text-align: center;
        font-size: 11px;
        font-weight: bold;
        margin: 8px 0;
        text-transform: uppercase;
        border: 1px solid #000;
        padding: 4px 0;
      }
      
      .transaction-details {
        margin-bottom: 8px;
        border-bottom: 1px dotted #000;
        padding-bottom: 6px;
      }
      
      .detail-row {
        margin-bottom: 3px;
        font-size: 10px;
      }
      
      .detail-label {
        font-weight: normal;
        margin-bottom: 1px;
      }
      
      .detail-value {
        font-weight: bold;
        margin-bottom: 2px;
      }
      
      .amounts-section {
        margin-bottom: 8px;
        border-bottom: 1px dotted #000;
        padding-bottom: 6px;
      }
      
      .amount-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 10px;
      }
      
      .amount-label {
        font-weight: normal;
      }
      
      .amount-value {
        font-weight: bold;
      }
      
      .attendant-section {
        text-align: center;
        margin: 10px 0;
        border-bottom: 1px dotted #000;
        padding-bottom: 8px;
      }
      
      .attendant-text {
        font-size: 9px;
        font-weight: normal;
        margin-bottom: 2px;
      }
      
      .attendant-name {
        font-size: 10px;
        font-weight: bold;
      }
      
      .signature-section {
        text-align: center;
        margin-top: 10px;
        margin-bottom: 8px;
      }
      
      .signature-line {
        border-top: 1px solid #000;
        width: 45%;
        margin: 15px auto 6px auto;
      }
      
      .signature-label {
        font-size: 9px;
        font-weight: bold;
      }
      
      .footer-note {
        text-align: center;
        font-size: 8px;
        font-style: italic;
        margin-top: 8px;
        border-top: 1px dotted #000;
        padding-top: 6px;
      }
      
      @page {
        margin: 3mm;
        size: A5 portrait;
      }
      
      @media print {
        .receipt-container {
          border: none;
          height: auto;
        }
      }
    `;
  }

  private clearTimeouts(): void {
    if (this.printTimeout) {
      clearTimeout(this.printTimeout);
      this.printTimeout = null;
    }
    if (this.windowCloseTimeout) {
      clearTimeout(this.windowCloseTimeout);
      this.windowCloseTimeout = null;
    }
  }

  private closeCurrentAngularWindow(): void {
    this.clearTimeouts();

    if (window.opener && window.opener !== window) {
      window.close();
    } else {
      this.goBack();
    }
  }

  protected executeDirectPrint(): void {
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const printWindowWidth = 800;
    const printWindowHeight = 600;
    const left = (screenWidth - printWindowWidth) / 2;
    const top = (screenHeight - printWindowHeight) / 2;
    
    const printWindow = window.open(
      '', 
      '_blank', 
      `width=${printWindowWidth},height=${printWindowHeight},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
    );
    
    if (!printWindow) {
      console.error('No se pudo abrir la ventana de impresión. Asegúrate de que los pop-ups no estén bloqueados.');
      this.closeCurrentAngularWindow(); 
      return;
    }

    const printHtml = this.generateReceiptHTML();

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();

    printWindow.focus();

    const handleClose = () => {
      if (!printWindow.closed) {
        printWindow.close();
      }
      this.closeCurrentAngularWindow();
    };

    // Configurar cierre automático por timeout más agresivo
    this.windowCloseTimeout = setTimeout(() => {
      handleClose();
    }, 3000); // Reducido a 3 segundos

    printWindow.onload = () => {
      this.printTimeout = setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        setTimeout(() => {
          this.closeCurrentAngularWindow();
        }, 2000);
        
      }, 200);
    };

    // Detectar cuando la ventana de impresión se cierra (por cancelar o terminar impresión)
    const checkClosed = setInterval(() => {
      if (printWindow.closed) {
        clearInterval(checkClosed);
        this.clearTimeouts();
        this.closeCurrentAngularWindow();
      }
    }, 500);

    // Limpiar el interval después de un tiempo máximo
    setTimeout(() => {
      clearInterval(checkClosed);
    }, 30000);

    printWindow.addEventListener('afterprint', () => {
      this.clearTimeouts();
      setTimeout(() => {
        handleClose();
      }, 100);
    });

    printWindow.addEventListener('beforeunload', () => {
      setTimeout(() => {
        this.closeCurrentAngularWindow();
      }, 100);
    });
  }

  protected formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  protected formatTime(date: Date): string {
    return date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  protected formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  }

  protected goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  static printReceiptDirect(receiptId: string, router: Router, modulePath: string, onClose?: () => void ) : void {
  }


  static previewReceipt(receiptId: string, router: Router, modulePath: string): void {
    router.navigate([`/${modulePath}/reports/receipts/${receiptId}`]);
  }

  static printReceiptWithPreview(receiptId: string, router: Router, modulePath: string): void {
    const url = `/${modulePath}/reports/receipts/${receiptId}?autoPrint=true`;
    window.open(url, '_blank', 'width=800,height=600');
  }
}