import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import localeEsDO from '@angular/common/locales/es-DO';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEsDO, 'es-DO');
registerLocaleData(localeEs, 'es');

if (environment.production) {
  enableProdMode();
}

import('./app/app.module')
  .then(m => platformBrowserDynamic().bootstrapModule(m.AppModule))
  .catch(err => console.error(err));
