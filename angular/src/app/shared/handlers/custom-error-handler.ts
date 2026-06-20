import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler as NgErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorReporterService } from '@abp/ng.core';

/**
 * Custom error handler that suppresses certain initialization errors from showing modals
 */
@Injectable()
export class CustomErrorHandler implements NgErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    // Get the HTTP error reporter service
    const httpErrorReporter = this.injector.get(HttpErrorReporterService, null);

    if (error instanceof HttpErrorResponse) {
      // Check if this is an initialization error that should be suppressed
      if (this.shouldSuppressError(error)) {
        console.warn('Suppressed initialization error:', {
          url: error.url,
          status: error.status,
          message: error.message
        });
        return; // Don't show error modal
      }
    }

    // For all other errors, log to console
    console.error('Application error:', error);

    // Report HTTP errors to ABP if it's an HTTP error
    if (error instanceof HttpErrorResponse && httpErrorReporter) {
      httpErrorReporter.reportError(error);
    }
  }

  private shouldSuppressError(error: HttpErrorResponse): boolean {
    const url = error.url || '';

    // Suppress authentication errors
    if (error.status === 401 || error.status === 403) {
      return true;
    }

    // Suppress initialization errors
    const initializationUrls = [
      'getEnvConfig',
      '/getEnvConfig'
    ];

    if (initializationUrls.some(initUrl => url.includes(initUrl))) {
      return true;
    }

    // Suppress network errors (0 = network error, 504 = gateway timeout)
    if (error.status === 0 || error.status === 504) {
      return true;
    }

    return false;
  }
}
