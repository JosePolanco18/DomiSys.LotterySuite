import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Service to handle HTTP errors and determine which ones should show error modals
 */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  private silentErrorUrls: string[] = [
    'getEnvConfig',
    '/getEnvConfig'
  ];

  /**
   * Determine if an error should be shown to the user
   * @param error The HTTP error response
   * @returns true if the error should be shown, false if it should be silent
   */
  shouldShowError(error: HttpErrorResponse): boolean {
    // Don't show 401/403 errors (authentication/authorization)
    if (error.status === 401 || error.status === 403) {
      return false;
    }

    // Don't show errors from silent URLs (initialization errors)
    const url = error.url || '';
    if (this.silentErrorUrls.some(silentUrl => url.includes(silentUrl))) {
      return false;
    }

    // Don't show network errors during app initialization
    if (error.status === 0 || error.status === 504) {
      // Gateway timeout or network error
      console.warn('Network error detected:', error);
      return false;
    }

    // Show all other errors
    return true;
  }

  /**
   * Get a user-friendly error message from an HTTP error
   */
  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.error?.message) {
      return error.error.error.message;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.message) {
      return error.message;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor';
    }

    return 'Ha ocurrido un error inesperado';
  }
}
