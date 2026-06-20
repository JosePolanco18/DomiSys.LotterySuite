// src/app/shared/components/input/input.component.ts
import { Component, Input, Output, EventEmitter, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlValueAccessor, NgControl } from '@angular/forms';

// ng-bootstrap
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

// ngx-bootstrap
import { BsDatepickerModule, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';

// date-fns para manejo robusto de fechas
import { parseISO, isValid, format, parse } from 'date-fns';

import { InputType, InputSize } from './models/input.interface';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    BsDatepickerModule,
    InputTextModule,
    InputNumberModule,
    InputMaskModule,
    PasswordModule,
    TextareaModule
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: []
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @ViewChild(BsDatepickerDirective, { static: false }) datepicker?: BsDatepickerDirective;

  // Basic inputs
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() maxLength: number | null = null;
  @Input() minLength: number | null = null;
  @Input() pattern: string = '';
  @Input() autocomplete: string = '';
  @Input() helperText: string = '';
  @Input() errorMessage: string = '';
  @Input() showCharacterCount: boolean = false;
  @Input() id: string = '';
  @Input() hideInputMarginBottom = false;


  // Number/Currency specific
  @Input() currency: string = 'USD';
  @Input() currencyDisplay: 'symbol' | 'code' | 'name' = 'symbol';
  @Input() locale: string = 'en-US';
  @Input() minFractionDigits: number = 2;
  @Input() maxFractionDigits: number = 2;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number = 1;
  @Input() zeroIsValid = false;


  // Mask specific
  @Input() mask: string = '';
  @Input() slotChar: string = '_';

  // Date specific - ngx-bootstrap
  @Input() dateFormat: string = 'dd/mm/yyyy';
  @Input() showIcon: boolean = true;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() showWeekNumbers: boolean = false;
  @Input() daysDisabled: number[] = [];
  @Input() datesDisabled: Date[] = [];
  @Input() datesEnabled: Date[] = [];
  @Input() containerClass: string = 'theme-default';
  @Input() placement: string = 'bottom';
  @Input() showTodayButton: boolean = false;
  @Input() showClearButton: boolean = false;
  @Input() adaptivePosition: boolean = true;
  @Input() isAnimated: boolean = true;

  // Textarea specific
  @Input() rows: number = 3;
  @Input() cols: number | null = null;
  @Input() autoResize: boolean = false;

  @Output() inputChange = new EventEmitter<any>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value: any = '';
  isFocused: boolean = false;

  // ControlValueAccessor methods
  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // Generate unique ID if not provided
    if (!this.id) {
      this.id = 'input-' + Math.random().toString(36).substr(2, 9);
    }
  }

  get primeNgCurrencyConfig() {
    if (this.currency === 'DOP') {
      return {
        mode: 'currency',
        currency: 'DOP',
        locale: 'es-DO',
        currencyDisplay: 'symbol',
        prefix: 'RD$ ',
        minFractionDigits: this.minFractionDigits,
        maxFractionDigits: this.maxFractionDigits
      };
    }

    return {
      mode: 'currency',
      currency: this.currency,
      locale: this.locale,
      currencyDisplay: this.currencyDisplay,
      minFractionDigits: this.minFractionDigits,
      maxFractionDigits: this.maxFractionDigits
    };
  }

  get inputClasses(): string {
    const classes = [
      'form-control',
      'form-control-solid',
      'w-100'
    ];

    // Tamaños con clases de Metronic
    if (this.size === 'sm') {
      classes.push('form-control-sm');
    } else if (this.size === 'lg') {
      classes.push('form-control-lg');
    }

    // Estados
    if (this.errorMessage) {
      classes.push('is-invalid');
    }

    return classes.join(' ');
  }

  get textareaClasses(): string {
    const classes = [
      'form-control',
      'form-control-solid',
      'w-100'
    ];

    // Tamaños con clases de Metronic
    if (this.size === 'sm') {
      classes.push('form-control-sm');
    } else if (this.size === 'lg') {
      classes.push('form-control-lg');
    }

    // Estados
    if (this.errorMessage) {
      classes.push('is-invalid');
    }

    return classes.join(' ');
  }

  get primeNgWrapperClasses(): string {
    const classes = ['w-100'];

    if (this.size === 'sm') {
      classes.push('form-control-sm');
    } else if (this.size === 'lg') {
      classes.push('form-control-lg');
    }

    if (this.errorMessage) {
      classes.push('is-invalid');
    }

    return classes.join(' ');
  }

  get containerClasses(): string {
    const classes = ['mb-5'];
    if (this.hideInputMarginBottom) {
      classes.splice(classes.indexOf('mb-5'), 1);
    }

    if (this.errorMessage) {
      classes.push('has-error');
    }

    if (this.disabled) {
      classes.push('disabled');
    }

    if (this.readonly) {
      classes.push('readonly-container');
    }

    return classes.join(' ');
  }

  get characterCount(): string {
    const current = this.value ? this.value.toString().length : 0;
    const max = this.maxLength;
    return max ? `${current}/${max}` : `${current}`;
  }

  get isFormControl(): boolean {
    return !!(this.ngControl && this.ngControl.control);
  }

  get isRequired(): boolean {
    if (this.ngControl?.control) {
      return this.ngControl.control.hasError('required') ||
        this.ngControl.control.validator?.({} as AbstractControl)?.['required'];
    }
    return this.required || false;
  }

  get isValid(): boolean {
    if (!this.ngControl?.control) return false;

    const control = this.ngControl.control;
    return control.valid &&
      (control.dirty || control.touched || (control.value !== null && control.value !== undefined && control.value !== ''));
  }

  get bsDatepickerConfig() {
    return {
      dateInputFormat: 'DD/MM/YYYY',
      containerClass: 'theme-blue',
      showWeekNumbers: this.showWeekNumbers,
      minDate: this.minDate,
      maxDate: this.maxDate,
      daysDisabled: this.daysDisabled,
      datesDisabled: this.datesDisabled,
      datesEnabled: this.datesEnabled.length > 0 ? this.datesEnabled : undefined,
      placement: this.placement,
      showTodayButton: this.showTodayButton,
      showClearButton: this.showClearButton,
      adaptivePosition: this.adaptivePosition,
      isAnimated: this.isAnimated,
      locale: 'es'
    };
  }

  /**
   * Convierte un string de fecha a objeto Date usando date-fns
   * Maneja múltiples formatos de fecha de manera robusta
   */
  private parseStringToDate(dateString: string): Date | null {
    try {
      // Formato ISO (YYYY-MM-DD)
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parseISO(dateString);
        return isValid(parsedDate) ? parsedDate : null;
      }

      // Formato ISO con tiempo (YYYY-MM-DDTHH:mm:ss)
      if (dateString.match(/^\d{4}-\d{2}-\d{2}T/)) {
        const parsedDate = parseISO(dateString);
        return isValid(parsedDate) ? parsedDate : null;
      }

      // Formato DD/MM/YYYY
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        return isValid(parsedDate) ? parsedDate : null;
      }

      // Formato MM/DD/YYYY
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parsedDate = parse(dateString, 'MM/dd/yyyy', new Date());
        return isValid(parsedDate) ? parsedDate : null;
      }

      // Formato DD-MM-YYYY
      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
        return isValid(parsedDate) ? parsedDate : null;
      }

      // Fallback: usar el constructor Date nativo
      const fallbackDate = new Date(dateString);
      return isValid(fallbackDate) ? fallbackDate : null;

    } catch (error) {
      console.warn('Error parsing date string:', dateString, error);
      return null;
    }
  }

  /**
   * Convierte cualquier valor a Date usando date-fns
   */
  private convertToDate(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return isValid(value) ? value : null;
    }

    if (typeof value === 'string') {
      return this.parseStringToDate(value);
    }

    if (typeof value === 'number') {
      const dateFromNumber = new Date(value);
      return isValid(dateFromNumber) ? dateFromNumber : null;
    }

    // Si es un objeto con propiedades de fecha
    if (typeof value === 'object' && value.year && value.month && value.day) {
      const dateFromObject = new Date(value.year, value.month - 1, value.day);
      return isValid(dateFromObject) ? dateFromObject : null;
    }

    return null;
  }

  onValueChange(newValue: any): void {
    let processedValue = newValue;

    // Para números y monedas, manejar valores null/undefined correctamente
    if (this.type === 'number' || this.type === 'currency') {
      if (newValue === null || newValue === undefined || newValue === '' || (newValue === 0 && !this.zeroIsValid)) {
        processedValue = null; // Mantener null para campo completamente vacío
      } else {
        const numValue = Number(newValue);
        processedValue = isNaN(numValue) ? null : numValue;
      }
    }
    // Para máscaras, limpiar el valor si está vacío o solo contiene caracteres de máscara
    else if (this.type === 'mask' && newValue) {
      const cleanValue = newValue.replace(/[\(\)\-\s]/g, '');
      if (cleanValue === '' || cleanValue === this.slotChar.repeat(cleanValue.length)) {
        processedValue = '';
      }
    }
    // Para fechas, asegurar que sea un objeto Date válido
    else if (this.type === 'date' && newValue) {
      processedValue = this.convertToDate(newValue);
    }

    this.value = processedValue;
    this.onChange(processedValue);
    this.inputChange.emit(processedValue);
  }

  onBsDateSelect(date: Date | null): void {
    if (date instanceof Date && isValid(date)) {
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
      this.value = normalizedDate;
      this.onChange(normalizedDate);
      this.inputChange.emit(normalizedDate);
    } else if (date === null) {
      this.value = null;
      this.onChange(null);
      this.inputChange.emit(null);
    }
  }
  // Método para manejar clics en el input de fecha
  onDateInputClick(event: any): void {
    // Si está en readonly, prevenir que se abra el datepicker
    if (this.readonly) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  // Método para abrir el datepicker desde el botón
  openDatepicker(event: any): void {
    event.preventDefault();
    event.stopPropagation();

    // No abrir si está readonly o disabled
    if (this.readonly || this.disabled) {
      this.datepicker.isDisabled = true;
    }

    // Buscar el input con bsDatepicker en el DOM
    const inputElement = event.target.closest('.input-group').querySelector('input[bsDatepicker]');
    if (inputElement) {
      inputElement.click();
      inputElement.focus();
    }
  }

  // Método cuando el datepicker se abre
  onDatepickerShow(): void {
    this.onFocus();
  }

  // Método cuando el datepicker se cierra
  onDatepickerHide(): void {
    this.onBlur();
  }

  // Método para formatear fecha para mostrar en readonly
  formatDateForDisplay(date: Date | null): string {
    if (!date || !isValid(date)) return '';

    try {
      return format(date, 'dd/MM/yyyy');
    } catch {
      return '';
    }
  }

  onFocus(): void {
    this.isFocused = true;
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.inputBlur.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.type === 'date') {
      const convertedDate = this.convertToDate(value);
      if (convertedDate) {
        this.value = new Date(convertedDate.getFullYear(), convertedDate.getMonth(), convertedDate.getDate(), 12, 0, 0, 0);
      } else {
        this.value = null;
      }
    } else if (this.type === 'number' || this.type === 'currency') {
      // Para PrimeNG inputNumber, mantener null para campo vacío
      if (value === null || value === undefined || value === '' || value === 0) {
        this.value = null;
      } else {
        const numValue = Number(value);
        this.value = isNaN(numValue) ? null : numValue;
      }
    } else if (this.type === 'mask') {
      this.value = value || '';
    } else {
      this.value = value !== null && value !== undefined ? value : '';
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}