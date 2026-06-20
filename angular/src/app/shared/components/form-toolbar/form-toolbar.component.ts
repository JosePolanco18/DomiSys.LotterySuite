import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../button/button.component';
import { FormToolbarConfig, FormToolbarButton, FormToolbarEvent } from './models/form-toolbar.interface';

@Component({
  selector: 'app-form-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent
  ],
  templateUrl: './form-toolbar.component.html',
  styleUrls: ['./form-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None // Esto elimina la encapsulación de estilos
})
export class FormToolbarComponent implements OnInit {
  @Input() config: FormToolbarConfig = {};
  @Input() formValid: boolean = false;
  @Input() loading: boolean = false;
  @Input() isDirty: boolean = false;
  @Input() showDirtyTag: boolean = true;

  @Output() buttonClick = new EventEmitter<FormToolbarEvent>();
  @Output() save = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  get visibleButtons(): FormToolbarButton[] {
    if (!this.config.buttons) return [];
    
    return this.config.buttons
      .filter(button => button.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  get showStickyClass(): boolean {
    return this.config.sticky !== false;
  }

  get saveButtonDisabled(): boolean {
    return this.loading;
  }

  get saveButtonIcon(): string {
    return this.loading ? 'pi-spin pi-spinner' : 'pi-check';
  }

  ngOnInit() {
    this.config = {
      showBackButton: false,
      backButtonLabel: 'Volver',
      showSaveButton: true,
      saveButtonLabel: 'Guardar',
      showCancelButton: true,
      cancelButtonLabel: 'Cancelar',
      sticky: true,
      ...this.config
    };
  }

  onButtonClick(button: FormToolbarButton): void {
    if (button.disabled || this.loading) return;

    if (button.onClick) {
      button.onClick();
      return;
    }

    const event: FormToolbarEvent = {
      buttonId: button.id,
      button: button,
      type: 'action'
    };

    this.buttonClick.emit(event);
  }

  onSave(): void {
    if (this.loading) return;
    
    if (this.config.onSave) {
      this.config.onSave();
      return;
    }
    
    this.save.emit();
  }

  onCancel(): void {
    if (this.loading) return;
    
    if (this.config.onCancel) {
      this.config.onCancel();
      return;
    }
    
    this.cancelled.emit();
  }

  onBack(): void {
    if (this.loading) return;
    
    if (this.config.onBack) {
      this.config.onBack();
      return;
    }
    
    this.back.emit();
  }
}