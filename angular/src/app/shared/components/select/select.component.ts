import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  DoCheck,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  forwardRef,
  TemplateRef,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, FormGroupDirective } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

export interface SelectOption {
  id: any;
  [key: string]: any;
}

export interface SelectService {
  getList(input: { filter?: string, sorting?: string, skipCount?: number, maxResultCount?: number, [key: string]: any }): Observable<{ items: SelectOption[], totalCount: number }>;
  get(id: any): Observable<SelectOption>;
  [key: string]: any;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck, OnChanges, ControlValueAccessor {
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  private readonly destroy$ = new Subject<void>();
  public readonly searchInput$ = new Subject<string>();
  private readonly dependentValueChange$ = new Subject<any>();
  private currentPage = 0;
  private readonly pageSize = 10;
  private ngControl: NgControl | null = null;
  private lastTouchedState = false;
  private lastValidState = true;
  private lastDependentValue: any = null;
  private _selectedValue: any = null; // Variable privada para el valor

  // Public properties
  loading = false;
  items: SelectOption[] = [];
  hasMoreItems = true;

  // Inputs
  @Input() label?: string;
  @Input() placeholder = 'Seleccione una opción';
  @Input() bindValue = 'id';
  @Input() bindLabel = 'name';
  @Input() bindCode?: string;
  @Input() showCode = false;
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearable = true;
  @Input() multiple = false;
  @Input() virtualScroll = true;
  @Input() searchable = true;
  @Input() service?: SelectService;
  @Input() staticItems: SelectOption[] = [];
  @Input() debounceTime = 300;
  @Input() loadOnOpen = true;
  @Input() appendTo?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  // Propiedades para carga relacionada
  @Input() dependentOn?: string;
  @Input() dependentMethod?: string;
  @Input() dependentControl?: AbstractControl;
  @Input() clearOnDependentChange = true;
  @Input() disableWhenNoDependentValue = true;
  @Input() dependentPlaceholder?: string;

  // Quick creation
  @Input() showQuickCreate = false;
  @Input() quickCreateRoute?: string;
  @Input() quickCreateText = 'Crear nuevo';

  // Templates
  @Input() optionTemplate?: TemplateRef<any>;
  @Input() labelTemplate?: TemplateRef<any>;

  // Outputs
  @Output() selectionChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() quickCreateClick = new EventEmitter<void>();

  // ControlValueAccessor
  private onChange = (value: any) => { };
  private onTouched = () => { };

  // Getter y setter para selectedValue - SIN auto-sincronización
  get selectedValue(): any {
    return this._selectedValue;
  }

  set selectedValue(value: any) {
    // Solo asignar el valor, NO auto-sincronizar para evitar recursión
    this._selectedValue = value;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) { }

  ngOnInit(): void {
    try {
      this.ngControl = this.injector.get(NgControl, null);
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;

        if (this.ngControl.control) {
          // NO escuchar valueChanges aquí - causa recursión infinita
          // El writeValue() ya maneja los cambios externos del FormControl

          this.ngControl.control.statusChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.cdr.markForCheck();
            });
        }
      }
    } catch (error) {
      this.ngControl = null;
    }

    this.setupSearch();
    this.setupDependentLoading();

    if (this.staticItems.length > 0) {
      this.items = [...this.staticItems];
      this.hasMoreItems = false;
    } else if (this.service && !this.dependentOn) {
      this.loadInitialItems();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] || changes['readonly']) {
      this.cdr.markForCheck();
    }

    if (changes['staticItems']) {
      if (this.staticItems.length > 0) {
        this.items = [...this.staticItems];
        this.hasMoreItems = false;
        this.cdr.markForCheck();
      }
    }

    // Detectar cambios en el servicio
    if (changes['service']) {
      this.items = [];
      this.hasMoreItems = true;
      this.resetPagination();

      if (this.clearOnDependentChange && this.selectedValue) {
        this.clearSelection();
      }

      if (this.service && !this.dependentOn) {
        this.loadInitialItems();
      }

      this.cdr.markForCheck();
    }
  }

  ngDoCheck(): void {
    if (this.ngControl?.control) {
      const currentTouched = this.ngControl.control.touched;
      const currentValid = this.ngControl.control.valid;

      if (currentTouched !== this.lastTouchedState || currentValid !== this.lastValidState) {
        this.lastTouchedState = currentTouched;
        this.lastValidState = currentValid;
        this.cdr.markForCheck();
      }
    }
  }

  ngAfterViewInit(): void {
    // NO hacer sincronización automática aquí tampoco
    if (this.ngControl?.control) {
      setTimeout(() => {
        this.cdr.markForCheck();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== CONTROL VALUE ACCESSOR MEJORADO =====
  writeValue(value: any): void {

    const previousValue = this._selectedValue;
    this._selectedValue = value;

    // Si hay un valor y servicio, asegurar que el item esté cargado
    if (value && this.service && value !== previousValue) {
      this.loadSelectedItemDirectly(value);
    }

    // SOLO marcar para detección de cambios, NO sincronizar automáticamente
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // ===== SINCRONIZACIÓN CON NG-SELECT =====
  private syncWithNgSelect(): void {
    if (this.ngSelect) {
      // Forzar la actualización del valor en ng-select
      this.ngSelect.writeValue(this._selectedValue);

      // Si el valor no está en los items actuales, intentar cargarlo
      if (this._selectedValue && !this.items.find(item => item[this.bindValue] === this._selectedValue)) {
        this.loadSelectedItemDirectly(this._selectedValue);
      }
    }
  }

  // Versión "silenciosa" que no dispara eventos adicionales
  private syncWithNgSelectSilently(): void {
    if (this.ngSelect) {
      // Temporalmente desconectar los eventos para evitar recursión
      const originalOnChange = this.ngSelect.writeValue;

      // Actualizar el valor directamente
      this.ngSelect.writeValue(this._selectedValue);

      // Si el valor no está en los items actuales, intentar cargarlo
      if (this._selectedValue && !this.items.find(item => item[this.bindValue] === this._selectedValue)) {
        this.loadSelectedItemDirectly(this._selectedValue);
      }
    }
  }

  // ===== EVENTOS DE NG-SELECT =====
  onSelectionChange(value: any): void {

    // Prevenir recursión: solo actualizar si el valor realmente cambió
    if (this._selectedValue !== value) {
      // Asignar directamente SIN disparar el setter automático
      this._selectedValue = value;

      // Notificar al FormControl del cambio
      this.onChange(value);
      this.onTouched();
      this.selectionChange.emit(value);
      this.cdr.markForCheck();
    }
  }

  onOpen(): void {
    if (this.loadOnOpen && this.items.length === 0 && this.service && !this.isWaitingForDependentValue()) {
      if (!this.dependentOn) {
        this.loadInitialItems();
      }
    }
    this.opened.emit();
  }

  onClose(): void {
    this.onTouched();
    this.closed.emit();
  }

  onScrollToEnd(): void {
    if (this.hasMoreItems && !this.loading && this.service && !this.dependentOn) {
      this.loadMoreItems();
    }
  }

  onQuickCreateClick(): void {
    if (this.quickCreateRoute) {
      this.openQuickCreateModal();
    }
    this.quickCreateClick.emit();
  }

  // ===== MÉTODOS DE CARGA =====
  private setupSearch(): void {
    this.searchInput$
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        tap(() => {
          this.resetPagination();
        }),
        switchMap(term => {
          const searchTerm = String(term || '');
          return this.searchItems(searchTerm);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.items = result.items;
        this.hasMoreItems = result.items.length === this.pageSize;

        // Asegurar que el valor seleccionado esté visible después de la búsqueda
        if (this._selectedValue && !this.items.find(item => item[this.bindValue] === this._selectedValue)) {
          this.loadSelectedItemDirectly(this._selectedValue);
        }

        this.cdr.markForCheck();
      });
  }

  private setupDependentLoading(): void {
    if (!this.dependentOn) return;

    let dependentControl = this.findDependentControl();
    if (!dependentControl) return;

    // Si ya hay un valor en el control dependiente, cargar inmediatamente
    if (dependentControl.value) {
      this.handleDependentValueChange(dependentControl.value);
    }

    dependentControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(dependentValue => {
        this.handleDependentValueChange(dependentValue);
      });
  }

  private findDependentControl(): AbstractControl | null {
    if (this.dependentControl) {
      return this.dependentControl.get(this.dependentOn);
    }

    let currentFormGroup = null;
    let parentFormGroup = null;

    if (this.ngControl?.control?.parent) {
      currentFormGroup = this.ngControl.control.parent;
      parentFormGroup = this.ngControl.control.parent.parent;
    } else {
      try {
        const formGroupDirective = this.injector.get(FormGroupDirective, null);
        if (formGroupDirective?.form) {
          parentFormGroup = formGroupDirective.form;
        }
      } catch (error) {
        // Silencioso
      }
    }

    if (currentFormGroup) {
      const control = currentFormGroup.get(this.dependentOn);
      if (control) return control;
    }

    if (parentFormGroup) {
      return parentFormGroup.get(this.dependentOn);
    }

    return null;
  }

  private handleDependentValueChange(dependentValue: any): void {

    if (this.clearOnDependentChange && this.lastDependentValue !== dependentValue) {
      this.clearSelection();
      this.items = [];
      this.hasMoreItems = false;
    }

    this.lastDependentValue = dependentValue;

    if (!dependentValue) {
      this.items = [];
      this.hasMoreItems = false;
      this.selectedValue = null;
      this.onChange(null);
      this.cdr.markForCheck();
      return;
    }

    this.loadDependentItems(dependentValue);
  }

  private loadDependentItems(dependentValue: any): void {
    if (!this.service || !this.dependentMethod) return;

    if (typeof this.service[this.dependentMethod] !== 'function') {
      console.error(`Método ${this.dependentMethod} no existe en el servicio`);
      return;
    }

    this.loading = true;
    this.resetPagination();

    const observable: Observable<SelectOption[]> = this.service[this.dependentMethod](dependentValue);

    observable
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: result => {
          if (Array.isArray(result)) {
            this.items = result;
          } else {
            this.items = [];
          }

          this.hasMoreItems = false;

          // Si hay un valor seleccionado que ya no está en la nueva lista, cargarlo
          if (this._selectedValue && !this.items.find(item => item[this.bindValue] === this._selectedValue)) {
            this.loadSelectedItemDirectly(this._selectedValue);
          }

          // NO hacer sincronización automática aquí
          this.cdr.markForCheck();
        },
        error: error => {
          console.error(`Error loading dependent items for ${this.label}:`, error);
          this.items = [];
          this.hasMoreItems = false;
        }
      });
  }

  private clearSelection(): void {
    // Asignar directamente SIN disparar auto-sincronización
    this._selectedValue = null;
    this.onChange(null);
    this.onTouched();
    this.cdr.markForCheck();
  }

  private loadInitialItems(): void {
    if (!this.service || this.loading || this.isWaitingForDependentValue()) return;

    this.loading = true;
    this.resetPagination();

    const requestDto = {
      filter: '',
      sorting: '',
      skipCount: 0,
      maxResultCount: this.pageSize
    };

    this.service
      .getList(requestDto)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.items = result.items;
        this.hasMoreItems = result.items.length === this.pageSize;
        this.loadSelectedItemIfNeeded();
      });
  }

  private loadMoreItems(): void {
    if (!this.service || this.loading || this.dependentOn) return;

    this.loading = true;
    const skipCount = (this.currentPage + 1) * this.pageSize;

    this.service
      .getList({
        filter: '',
        sorting: '',
        skipCount: skipCount,
        maxResultCount: this.pageSize
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (result.items.length > 0) {
          this.items = [...this.items, ...result.items];
          this.currentPage++;
          this.hasMoreItems = result.items.length === this.pageSize;
        } else {
          this.hasMoreItems = false;
        }
      });
  }

  private searchItems(searchTerm: string): Observable<{ items: SelectOption[], totalCount: number }> {
    const cleanTerm = String(searchTerm || '').trim();

    if (!this.service) {
      return new Observable(subscriber => {
        const filtered = this.staticItems.filter(item =>
          item[this.bindLabel]?.toLowerCase().includes(cleanTerm.toLowerCase())
        );
        subscriber.next({ items: filtered, totalCount: filtered.length });
        subscriber.complete();
      });
    }

    if (this.dependentOn && this.isWaitingForDependentValue()) {
      return of({ items: [], totalCount: 0 });
    }

    if (this.dependentOn && this.items.length > 0) {
      return new Observable(subscriber => {
        const filtered = this.items.filter(item =>
          item[this.bindLabel]?.toLowerCase().includes(cleanTerm.toLowerCase())
        );
        subscriber.next({ items: filtered, totalCount: filtered.length });
        subscriber.complete();
      });
    }

    this.loading = true;

    const requestDto = {
      filter: cleanTerm,
      sorting: '',
      skipCount: 0,
      maxResultCount: this.pageSize
    };

    return this.service
      .getList(requestDto)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      );
  }

  private loadSelectedItemDirectly(value: any): void {
    if (!this.service || !value) return;

    const existingItem = this.items.find(item => item[this.bindValue] === value);
    if (existingItem) return;


    this.service.get(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: item => {
          if (item) {
            const stillNotInList = !this.items.find(existingItem => existingItem[this.bindValue] === item[this.bindValue]);
            if (stillNotInList) {
              this.items = [item, ...this.items];
              // NO sincronizar aquí - solo marcar para detección de cambios
              this.cdr.markForCheck();
            }
          }
        },
        error: error => {
          console.error(`Error loading selected item for ${this.label}:`, error);
        }
      });
  }

  private loadSelectedItemIfNeeded(): void {
    if (this._selectedValue && !this.items.find(item => item[this.bindValue] === this._selectedValue)) {
      this.loadSelectedItemDirectly(this._selectedValue);
    }
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.hasMoreItems = true;
  }

  private isWaitingForDependentValue(): boolean {
    if (!this.dependentOn) return false;

    const dependentControl = this.findDependentControl();
    return !dependentControl?.value;
  }

  private openQuickCreateModal(): void {
    if (this.quickCreateRoute) {
      const width = 800;
      const height = 600;
      const left = (screen.width / 2) - (width / 2);
      const top = (screen.height / 2) - (height / 2);

      const popup = window.open(
        this.quickCreateRoute,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (popup) {
        popup.focus();
      }
    }
  }

  // ===== MÉTODOS PARA EL TEMPLATE =====
  onSearch(term: string | any): void {
    const searchTerm = typeof term === 'string' ? term : (term?.term || term?.value || '');
    this.searchInput$.next(searchTerm);
  }

  get isInvalid(): boolean {
    if (!this.ngControl?.control) {
      return this.required && (this._selectedValue === null || this._selectedValue === undefined || this._selectedValue === '');
    }

    const control = this.ngControl.control;
    return !!(control.invalid && (control.touched || control.dirty));
  }

  get hasError(): boolean {
    return this.isInvalid;
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
    const value = control.value;

    const hasValue = this.multiple
      ? (Array.isArray(value) && value.length > 0)
      : (value !== null && value !== undefined && value !== '');

    return control.valid &&
      (control.dirty || control.touched || hasValue);
  }

  get isDisabledByDependency(): boolean {
    return this.disableWhenNoDependentValue && this.dependentOn && this.isWaitingForDependentValue();
  }

  get effectiveDisabled(): boolean {
    return this.disabled || this.readonly || this.isDisabledByDependency;
  }

  get effectivePlaceholder(): string {
    if (this.dependentOn && this.isWaitingForDependentValue() && this.dependentPlaceholder) {
      return this.dependentPlaceholder;
    }
    return this.placeholder;
  }

  get errorMessage(): string {
    if (!this.ngControl?.control?.errors) return '';

    const errors = this.ngControl.control.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['email']) {
      return 'Ingrese un email válido';
    }

    return 'Campo inválido';
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm': return 'form-select-sm';
      case 'lg': return 'form-select-lg';
      default: return '';
    }
  }

  get displayValue(): string {
    if (!this._selectedValue) return '';

    const item = this.items.find(i => i[this.bindValue] === this._selectedValue);
    if (!item) return '';

    let display = item[this.bindLabel];
    if (this.showCode && this.bindCode && item[this.bindCode]) {
      display = `${item[this.bindCode]} - ${display}`;
    }

    return display;
  }
}