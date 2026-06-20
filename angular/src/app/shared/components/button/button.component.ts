import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonSize, ButtonVariant } from './models/button.interface';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None // Permite que los estilos se apliquen globalmente
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() outline: boolean = false;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() style: string = '';


  @Output() buttonClick = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = [
      'app-button',
      `app-button--${this.variant}`,
      `app-button--${this.size}`
    ];

    if (this.outline) classes.push('app-button--outline');
    if (this.disabled) classes.push('app-button--disabled');
    if (this.loading) classes.push('app-button--loading');
    if (this.fullWidth) classes.push('app-button--full-width');
    if (this.icon && !this.label) classes.push('app-button--icon-only');

    return classes.join(' ');
  }

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit();
    }
  }
}