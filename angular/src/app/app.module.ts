import { CoreModule, provideAbpCore, withOptions, ReplaceableComponentsService, withTitleStrategy } from '@abp/ng.core';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { provideSettingManagementConfig } from '@abp/ng.setting-management/config';
import { provideFeatureManagementConfig } from '@abp/ng.feature-management';
import { ThemeSharedModule, provideAbpThemeShared } from '@abp/ng.theme.shared';
import { provideIdentityConfig } from '@abp/ng.identity/config';
import { eIdentityComponents } from '@abp/ng.identity';
import { provideAccountConfig } from '@abp/ng.account/config';
import { registerLocale, storeLocaleData } from '@abp/ng.core/locale';
import { ThemeBasicModule, provideThemeBasicConfig } from '@abp/ng.theme.basic';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { CustomTitleStrategy } from './shared/strategies/custom-title.strategy';

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UserListComponent } from './identity/users/list/user-list.component';
import { RoleListComponent } from './identity/roles/list/role-list.component';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandlerInterceptor } from './shared/interceptors/error-handler.interceptor';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';

import("@angular/common/locales/es-DO.mjs").then((m) => storeLocaleData(m.default, "es-DO"));

defineLocale('es', esLocale);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ThemeSharedModule,
    CoreModule,
    ThemeBasicModule,
    ToastModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    APP_ROUTE_PROVIDER,
    CustomTitleStrategy,
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocale(),
      }),
      withTitleStrategy(CustomTitleStrategy)
    ),
    provideAbpOAuth(),
    provideIdentityConfig(),
    provideSettingManagementConfig(),
    provideFeatureManagementConfig(),
    provideAccountConfig(),
    provideAbpThemeShared(),
    provideThemeBasicConfig(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false
        }
      }
    }),

    DialogService,
    MessageService,

    {
      provide: BsLocaleService,
      useFactory: () => {
        const localeService = new BsLocaleService();
        localeService.use('es');
        return localeService;
      }
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private localeService: BsLocaleService,
    private replaceableComponents: ReplaceableComponentsService
  ) {
    this.localeService.use('es');
    this.configureIdentityComponentReplacements();
  }

  private configureIdentityComponentReplacements(): void {
    this.replaceableComponents.add({
      component: UserListComponent,
      key: eIdentityComponents.Users,
    });
    this.replaceableComponents.add({
      component: RoleListComponent,
      key: eIdentityComponents.Roles,
    });
  }
}
