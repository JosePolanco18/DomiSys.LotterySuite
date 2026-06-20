import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../button/button.component';
import { ToolbarConfig, ToolbarButton, ToolbarEvent } from './models/toolbar.interface';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None // Esto elimina la encapsulación de estilos
})
export class ToolbarComponent implements OnInit {
  @Input() config: ToolbarConfig = {};
  @Input() loading: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchEnter = new EventEmitter<string>();
  @Output() searchClick = new EventEmitter<string>();
  @Output() buttonClick = new EventEmitter<ToolbarEvent>();

  searchValue: string = '';

  get visibleButtons(): ToolbarButton[] {
    if (!this.config.buttons) return [];
    
    return this.config.buttons
      .filter(button => button.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  get visibleButtonsExcludingSearch(): ToolbarButton[] {
    return this.visibleButtons.filter(button => 
      button.id !== 'search' && 
      button.id !== 'buscar' && 
      !button.label?.toLowerCase().includes('buscar') &&
      !button.label?.toLowerCase().includes('search')
    );
  }

  get searchPlaceholder(): string {
    return this.config.searchPlaceholder || 'Buscar...';
  }

  ngOnInit() {
    if (this.config.searchValue) {
      this.searchValue = this.config.searchValue;
    }
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchChange.emit(value);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchEnter.emit(this.searchValue);
    }
  }

  onSearchClick(): void {
    this.searchClick.emit(this.searchValue);
    this.searchEnter.emit(this.searchValue);
  }

  onButtonClick(button: ToolbarButton): void {
    if (button.disabled || this.loading) return;

    if (button.onClick) {
      button.onClick();
      return;
    }

    const event: ToolbarEvent = {
      buttonId: button.id,
      button: button,
      type: 'action'
    };

    this.buttonClick.emit(event);
  }
}