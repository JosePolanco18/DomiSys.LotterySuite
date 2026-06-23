import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CompanySettingsDto {
  name?: string;
  address?: string;
  phones?: string;
  rnc?: string;
  receiptPrintSize?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanySettingsService {
  get(): Observable<CompanySettingsDto | null> {
    return of({
      name: 'BANCA DE LOTERIA',
      address: '',
      phones: '',
      rnc: ''
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CompanyFileService {
  getLogoBase64(): Observable<string> {
    return of('');
  }
}
