import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cookie __tenant es la fuente de verdad (seteada por login.js)
    const match = document.cookie.match(/(?:^|;\s*)__tenant=([^;]*)/);
    const cookieTenant = match && match[1] ? decodeURIComponent(match[1]) : null;

    // Sincronizar localStorage con cookie
    if (cookieTenant) {
      localStorage.setItem('__tenant', cookieTenant);
    } else {
      localStorage.removeItem('__tenant');
    }

    if (cookieTenant) {
      req = req.clone({ setHeaders: { '__tenant': cookieTenant } });
    }
    return next.handle(req);
  }
}
