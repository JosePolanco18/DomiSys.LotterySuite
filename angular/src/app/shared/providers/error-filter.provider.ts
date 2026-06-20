import { HttpErrorResponse } from '@angular/common/http';
import { Provider } from '@angular/core';
import { ErrorScreenErrorCodes } from '@abp/ng.theme.shared';

/**
 * Custom error filter to suppress certain errors from showing error modals
 * This is used by ABP's error handling system
 */
export function customErrorFilter(injector: any) {
  return (httpError: HttpErrorResponse) => {
    const url = httpError.url || '';
    const status = httpError.status;

    // Don't show error modal for authentication/authorization errors
    if (status === 401 || status === 403) {
      return false; // Don't handle - let auth system handle it
    }

    // Don't show error modal for initialization errors
    const initializationUrls = [
      'getEnvConfig'
    ];

    const isInitializationError = initializationUrls.some(initUrl => url.includes(initUrl));
    if (isInitializationError) {
      console.warn('Suppressed initialization error:', { url, status });
      return false; // Don't show error modal
    }

    // Don't show error modal for network errors
    if (status === 0 || status === 504) {
      console.warn('Network error suppressed:', { url, status });
      return false;
    }

    // Show error modal for all other errors
    return true;
  };
}

/**
 * Provider to register the custom error filter with ABP
 */
export const CUSTOM_ERROR_FILTER_PROVIDER: Provider = {
  provide: ErrorScreenErrorCodes,
  useFactory: customErrorFilter,
  multi: true
};
