import { eLayoutType, SubscriptionService } from '@abp/ng.core';
import { collapseWithMargin, slideFromBottom } from '@abp/ng.theme.shared';
import { AfterViewInit, Component, inject, ViewEncapsulation, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  standalone: false,
  selector: 'abp-layout-application',
  templateUrl: './application-layout.component.html',
  styleUrls: [],
  animations: [slideFromBottom, collapseWithMargin],
  // encapsulation: ViewEncapsulation.None,
  providers: [LayoutService, SubscriptionService]
})
export class ApplicationLayoutComponent implements OnInit, AfterViewInit {
  public readonly service = inject(LayoutService);
  static type = eLayoutType.application;

  ngOnInit() {
    // El tema ya se configuró en index.html, solo aseguramos consistencia
    this.ensureThemeConsistency();
  }

  ngAfterViewInit() {
    this.service.subscribeWindowSize();
    
    // Esperar a que Metronic se renderice y luego configurar toggle
    setTimeout(() => {
      this.setupThemeToggle();
    }, 200);
  }

  private ensureThemeConsistency() {
    const htmlTheme = document.documentElement.getAttribute('data-bs-theme');
    if (htmlTheme) {
      document.body.setAttribute('data-bs-theme', htmlTheme);
    }
  }

  private setupThemeToggle() {
    // Buscar el componente de toggle de Metronic
    const toggles = document.querySelectorAll('[data-kt-element="theme-mode-toggle"], .theme-toggle, [class*="theme"]');
    
    // Si no hay toggle, mostrar mensaje
    if (toggles.length === 0) {
    }
  }
}