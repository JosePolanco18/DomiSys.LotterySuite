import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { Observable } from 'rxjs';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { ToolbarButton } from 'src/app/shared/components/toolbar/models/toolbar.interface';

export interface BaseEntityDto {
  id?: string;
  [key: string]: any;
}

export interface CreateUpdateDto {
  [key: string]: any;
}

export interface BaseService<TEntity extends BaseEntityDto, TCreateUpdateDto extends CreateUpdateDto> {
  get(id: string): Observable<TEntity>;
  create(input: TCreateUpdateDto): Observable<TEntity>;
  update(id: string, input: TCreateUpdateDto): Observable<TEntity>;
}

export interface BaseFormConfig {
  entityName: string; // "País", "Cliente", etc.
  entityNamePlural: string; // "países", "clientes", etc.
  listRoute: string; // "/geography/countries"
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
}

@Component({
  template: ''
})
export abstract class BaseFormComponent<TEntity extends BaseEntityDto, TCreateUpdateDto extends CreateUpdateDto> implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  id?: string;
  isLoading = false;
  entity: TEntity | null = null;

  formToolbarConfig: FormToolbarConfig = {
    title: '',
    subtitle: '',
    showBackButton: false,
    showSaveButton: true,
    saveButtonLabel: 'Guardar',
    showCancelButton: true,
    cancelButtonLabel: 'Cancelar',
    sticky: true,
    onSave: () => this.save(),
    onCancel: () => this.cancel(),
    buttons: [] // Inicializado vacío, se puede sobrescribir
  };

  protected abstract config: BaseFormConfig;
  protected abstract service: BaseService<TEntity, TCreateUpdateDto>;

  constructor(
    protected fb: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.initializeComponent();
  }

  private initializeComponent() {
    this.id = this.route.snapshot.params['id'];
    this.isEditMode = !!this.id;
    this.updateToolbarConfig();

    if (this.isEditMode) {
      this.loadEntity();
    }
  }

  protected updateToolbarConfig() {
    this.formToolbarConfig = {
      ...this.formToolbarConfig,
      title: this.isEditMode ? `Edición de ${this.config.entityName}` : `Creación de ${this.config.entityName}`,
      subtitle: this.isEditMode && this.entity
        ? `Editando: ${this.getEntityDisplayName(this.entity)}`
        : `Complete la información de ${this.config.entityName.toLowerCase()}`,
      saveButtonLabel: this.config.saveButtonLabel || `Guardar ${this.config.entityName.toLowerCase()}`,
      cancelButtonLabel: this.config.cancelButtonLabel || 'Cancelar',
      buttons: this.getAdditionalButtons() // Permite botones adicionales
    };
  }

  // Método que los componentes hijos pueden sobrescribir para agregar botones
  protected getAdditionalButtons(): ToolbarButton[] {
    return [];
  }

  get formValid(): boolean {
    return this.form.valid;
  }

  get formDirty(): boolean {
    return this.form.dirty;
  }

  protected loadEntity() {
    if (!this.id) return;

    this.isLoading = true;
    this.service.get(this.id).subscribe({
      next: (entity) => {
        this.entity = entity;

        this.form.patchValue(this.mapEntityToForm(entity));
        this.updateToolbarConfig();
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error loading ${this.config.entityName.toLowerCase()}:`, error);
        this.toasterService.error(`Error al cargar el ${this.config.entityName.toLowerCase()}`);
        this.isLoading = false;
        this.router.navigate([this.config.listRoute]);
      }
    });
  }

  getInvalidControls(): string[] {
    const invalid = [];
    const controls = this.form.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const invalidFields = this.getInvalidControls();

      this.toasterService.warn(
        `Por favor completa los siguientes campos: ${invalidFields.join(', ')}`
      );

      // this.toasterService.warn('Por favor corrige los errores en el formulario');
      return;
    }

    this.performSave();
  }

  cancel() {
    this.router.navigate([this.config.listRoute]);
  }

  protected createEntity(dto: TCreateUpdateDto) {
    this.isLoading = true;
    return this.service.create(dto).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.toasterService.success(`${this.config.entityName} creado exitosamente: ${this.getEntityDisplayName(result)}`);
        this.router.navigate([this.config.listRoute]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error(`Error creating ${this.config.entityName.toLowerCase()}:`, error);
        this.toasterService.error(`Error al crear el ${this.config.entityName.toLowerCase()}`);
      }
    });
  }

  protected updateEntity(dto: TCreateUpdateDto) {
    if (!this.id) {
      throw new Error('ID is required for update');
    }

    this.isLoading = true;
    return this.service.update(this.id, dto).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.toasterService.success(`${this.config.entityName} actualizado exitosamente: ${this.getEntityDisplayName(result)}`);
        this.router.navigate([this.config.listRoute]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error(`Error updating ${this.config.entityName.toLowerCase()}:`, error);
        this.toasterService.error(`Error al actualizar el ${this.config.entityName.toLowerCase()}`);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Formato de email inválido';
    if (errors['pattern']) return 'Formato inválido';

    return 'Campo inválido';
  }

  // Métodos abstractos - TODOS al final
  protected abstract buildForm(): void;
  protected abstract getEntityDisplayName(entity: TEntity): string;
  protected abstract mapEntityToForm(entity: TEntity): any;
  protected abstract mapFormToDto(formValue: any): TCreateUpdateDto;
  protected abstract performSave(): void;
}