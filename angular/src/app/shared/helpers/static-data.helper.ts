export interface StaticOption {
  label: string;
  value: string;
  identifier?: string;
}

export class StaticDataHelper {

  static formatCurrency(amount: number, currency: string = 'DOP'): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  static formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
    }
    return phone;
  }

  static getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'ACTIVA':
        return 'badge-success';
      case 'INACTIVE':
      case 'SUSPENDIDA':
        return 'badge-warning';
      case 'SUSPENDED':
      case 'BLOQUEADA':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
}
