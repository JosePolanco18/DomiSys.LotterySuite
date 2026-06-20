import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpStatusCode
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorHandlerService } from '../handlers/http-error-handler.service';

/**
 * HTTP Interceptor to handle errors globally
 * This interceptor will suppress certain errors from showing error modals
 * Must be registered BEFORE ABP interceptors to catch errors first
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private errorHandler = inject(HttpErrorHandlerService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if this error should be shown
        const shouldShow = this.errorHandler.shouldShowError(error);

        if (!shouldShow) {
          // Silently log the error but don't show modal
          console.warn('Silent HTTP error (suppressed):', {
            url: error.url,
            status: error.status,
            statusText: error.statusText,
            message: this.errorHandler.getErrorMessage(error)
          });

          // Create a new error with status set to a code that ABP ignores
          // ABP's error handler checks for specific status codes
          // We'll mark this with a custom header/flag that ABP will ignore
          const modifiedError = new HttpErrorResponse({
            error: error.error,
            headers: error.headers,
            status: error.status,
            statusText: `[HANDLED] ${error.statusText}`,
            url: error.url || undefined
          });

          // Add a custom property to mark this error as already handled
          (modifiedError as any).isHandled = true;
          (modifiedError as any).skipErrorHandler = true;

          return throwError(() => modifiedError);
        }

        // Re-throw the error for normal handling by ABP
        return throwError(() => error);
      })
    );
  }
}
