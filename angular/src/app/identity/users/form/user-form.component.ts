import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import {
  IdentityUserService,
  IdentityUserDto,
  IdentityUserCreateDto,
  IdentityUserUpdateDto,
  IdentityRoleService,
  IdentityRoleDto
} from '@abp/ng.identity/proxy';
import { FormToolbarComponent } from '../../../shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { SharedModule } from '../../../shared/shared.module';
import { BaseFormComponent, BaseFormConfig } from '../../../shared/components/base-form/base-form.component';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    InputComponent,
    FormToolbarComponent,
    TabViewModule,
    CheckboxModule,
    MultiSelectModule
  ]
})
export class UserFormComponent extends BaseFormComponent<IdentityUserDto, IdentityUserCreateDto | IdentityUserUpdateDto> implements OnInit {

  protected config: BaseFormConfig = {
    entityName: 'Usuario',
    entityNamePlural: 'usuarios',
    listRoute: '/identity/users',
    saveButtonLabel: 'Guardar usuario',
    cancelButtonLabel: 'Cancelar'
  };

  protected service = this.userService;

  roleOptions: IdentityRoleDto[] = [];
  selectedRoles: string[] = [];
  loadingRoles = false;

  constructor(
    protected override fb: FormBuilder,
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override toasterService: ToasterService,
    private userService: IdentityUserService,
    private roleService: IdentityRoleService
  ) {
    super(fb, route, router, toasterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadRoles();
  }

  protected buildForm(): void {
    const formConfig: any = {
      userName: ['', [Validators.required, Validators.maxLength(256)]],
      name: ['', [Validators.maxLength(64)]],
      surname: ['', [Validators.maxLength(64)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phoneNumber: ['', [Validators.maxLength(16)]],
      isActive: [true],
      lockoutEnabled: [false],
      roleNames: [[]]
    };

    // Solo agregar el campo password en modo creación
    if (!this.isEditMode) {
      formConfig.password = ['', [Validators.required, Validators.minLength(6)]];
    }

    this.form = this.fb.group(formConfig);
  }

  protected getEntityDisplayName(entity: IdentityUserDto): string {
    return entity.userName || entity.email || 'Usuario';
  }

  protected mapEntityToForm(entity: IdentityUserDto): any {
    return {
      userName: entity.userName,
      name: entity.name,
      surname: entity.surname,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      isActive: entity.isActive,
      lockoutEnabled: entity.lockoutEnabled,
      roleNames: []
    };
  }

  protected mapFormToDto(formValue: any): IdentityUserCreateDto | IdentityUserUpdateDto {
    const baseDto = {
      userName: formValue.userName,
      name: formValue.name,
      surname: formValue.surname,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      isActive: formValue.isActive,
      lockoutEnabled: formValue.lockoutEnabled,
      roleNames: formValue.roleNames || []
    };

    if (this.isEditMode) {
      return {
        ...baseDto,
        concurrencyStamp: this.entity?.concurrencyStamp
      } as IdentityUserUpdateDto;
    } else {
      return {
        ...baseDto,
        password: formValue.password
      } as IdentityUserCreateDto;
    }
  }

  protected performSave(): void {
    const formValue = this.form.value;
    const dto = this.mapFormToDto(formValue);

    if (this.isEditMode) {
      this.updateEntity(dto as IdentityUserUpdateDto);
    } else {
      this.createEntity(dto as IdentityUserCreateDto);
    }
  }

  private loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getList({ maxResultCount: 1000 }).subscribe({
      next: (response) => {
        this.roleOptions = response.items || [];
        this.loadingRoles = false;
      },
      error: (error) => {
        this.toasterService.error('Error al cargar los roles');
        this.loadingRoles = false;
      }
    });
  }

  protected override loadEntity(): void {
    if (!this.id) return;

    this.isLoading = true;
    this.service.get(this.id).subscribe({
      next: (entity) => {
        this.entity = entity;
        // Reconstruir el formulario sin el campo password
        this.buildForm();
        const formData = this.mapEntityToForm(entity);
        this.form.patchValue(formData);
        this.loadUserRoles(this.id!);
        this.updateToolbarConfig();
        this.isLoading = false;
      },
      error: (error) => {
        this.toasterService.error('Error al cargar el usuario');
        this.isLoading = false;
        this.router.navigate([this.config.listRoute]);
      }
    });
  }

  private loadUserRoles(userId: string): void {
    this.userService.getRoles(userId).subscribe({
      next: (response) => {
        const assignedRoleNames = response.items?.map(r => r.name) || [];
        this.form.patchValue({ roleNames: assignedRoleNames });
      },
      error: (error) => {
        this.toasterService.error('Error al cargar los roles del usuario');
      }
    });
  }
  get userName() { return this.form.get('userName'); }
  get password() { return this.form.get('password'); }
  get name() { return this.form.get('name'); }
  get surname() { return this.form.get('surname'); }
  get email() { return this.form.get('email'); }
  get phoneNumber() { return this.form.get('phoneNumber'); }
  get isActive() { return this.form.get('isActive'); }
  get lockoutEnabled() { return this.form.get('lockoutEnabled'); }
  get roleNames() { return this.form.get('roleNames'); }
}
