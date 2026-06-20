// footer.component.ts - VERSIÓN SEGURA
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgClass, NgTemplateOutlet, NgFor } from '@angular/common';
import { FooterActionsService, FooterAction } from '../../../../../../../../src/app/shared/services/footer-actions.service';
import { ButtonComponent } from '../../../../../../../../src/app/shared/components/button/button.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [NgIf, NgClass, NgTemplateOutlet, NgFor, ButtonComponent]
})
export class FooterComponent implements OnInit, OnDestroy {
  @Input() appFooterContainerCSSClass: string = '';

  currentDateStr: string = new Date().getFullYear().toString();
  actions: FooterAction[] = [];
  isActionsVisible = false;
  private destroy$ = new Subject<void>();

  constructor(private footerActionsService: FooterActionsService) {}

  ngOnInit(): void {
    this.footerActionsService.actions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(actions => {
        this.actions = actions.filter(action => action.visible !== false);
      });

    this.footerActionsService.visible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.isActionsVisible = visible;
        // NO manipular clases del body para evitar conflictos
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  executeAction(action: FooterAction): void {
    if (!action.disabled && !action.loading && action.callback) {
      action.callback();
    }
  }

  get hasActions(): boolean {
    return this.actions.length > 0;
  }
}