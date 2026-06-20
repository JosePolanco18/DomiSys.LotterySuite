import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dominicanCurrency',
  standalone: true
})
export class DominicanCurrencyPipe implements PipeTransform {
  
  transform(value: number | null | undefined, showSymbol: boolean = true): string {
    if (value === null || value === undefined || isNaN(value)) {
      return showSymbol ? 'RD$ 0.00' : '0.00';
    }

    // Formatear con separadores de miles y 2 decimales
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(Math.abs(value));

    const symbol = showSymbol ? 'RD$ ' : '';
    const sign = value < 0 ? '-' : '';
    
    return `${sign}${symbol}${formatted}`;
  }
}