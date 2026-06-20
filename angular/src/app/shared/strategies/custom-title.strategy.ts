import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { LocalizationService } from '@abp/ng.core';
import { PageInfoService } from '@abp/ng.theme.basic';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly localizationService = inject(LocalizationService);
  private readonly pageInfo = inject(PageInfoService);

  override updateTitle(routerState: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(routerState);

    // Esperar un poco para que PageInfoService calcule el título desde el menú
    setTimeout(() => {
      // Intentar obtener el título del PageInfoService (calculado desde el menú de Metronic)
      let pageTitle = '';
      this.pageInfo.title.subscribe((title: string) => {
        pageTitle = title;
      }).unsubscribe();

      // Si hay título del PageInfoService, usarlo
      if (pageTitle) {
        this.title.setTitle(`${pageTitle} - Financial Suite`);
        return;
      }

      // Si hay título de ruta pero no del PageInfoService, usar el de la ruta
      if (routeTitle) {
        const localizedText = this.localizationService.instant({
          key: routeTitle,
          defaultValue: routeTitle
        });
        this.title.setTitle(`${localizedText} - Financial Suite`);
        return;
      }

      // Si no hay ninguno, dejar "Financial Suite" por defecto
      this.title.setTitle('Financial Suite');
    }, 100);
  }
}
