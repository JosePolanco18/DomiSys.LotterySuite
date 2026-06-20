import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import {
  IdentityRoleService,
  IdentityRoleDto,
  IdentityRoleCreateDto,
  IdentityRoleUpdateDto
} from '@abp/ng.identity/proxy';
import { FormToolbarComponent } from '../../../shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SharedModule } from '../../../shared/shared.module';
import { BaseFormComponent, BaseFormConfig } from '../../../shared/components/base-form/base-form.component';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { PermissionTreeComponent } from '../../shared/components/permission-tree/permission-tree.component';
import { UpdatePermissionsDto } from '../../models/permission-tree.model';
import { PermissionsService, GetPermissionListResultDto } from '@abp/ng.permission-management/proxy';
import { finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    InputComponent,
    FormToolbarComponent,
    TabViewModule,
    CheckboxModule,
    PermissionTreeComponent
  ]
})
export class RoleFormComponent extends BaseFormComponent<IdentityRoleDto, IdentityRoleCreateDto | IdentityRoleUpdateDto> implements OnInit {
  @ViewChild(PermissionTreeComponent) permissionTree?: PermissionTreeComponent;

  protected config: BaseFormConfig = {
    entityName: 'Rol',
    entityNamePlural: 'roles',
    listRoute: '/identity/roles',
    saveButtonLabel: 'Guardar rol',
    cancelButtonLabel: 'Cancelar'
  };

  protected service = this.roleService;

  /**
   * Datos de permisos para el árbol
   */
  permissionsData?: GetPermissionListResultDto;
  loadingPermissions = false;

  /**
   * Permisos seleccionados
   */
  selectedPermissions: string[] = [];

  constructor(
    protected override fb: FormBuilder,
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override toasterService: ToasterService,
    private roleService: IdentityRoleService,
    private permissionsService: PermissionsService
  ) {
    super(fb, route, router, toasterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    // Escuchar cambios en el campo 'name' para cargar permisos dinámicamente
    this.form.get('name')?.valueChanges.subscribe((roleName) => {
      if (roleName && roleName.trim().length > 0) {
        this.loadRolePermissions(roleName);
      }
    });
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(256)]],
      isDefault: [false],
      isPublic: [false]
    });
  }

  protected getEntityDisplayName(entity: IdentityRoleDto): string {
    return entity.name || 'Rol';
  }

  protected mapEntityToForm(entity: IdentityRoleDto): any {
    return {
      name: entity.name,
      isDefault: entity.isDefault || false,
      isPublic: entity.isPublic || false
    };
  }

  protected mapFormToDto(formValue: any): IdentityRoleCreateDto | IdentityRoleUpdateDto {
    const baseDto = {
      name: formValue.name,
      isDefault: formValue.isDefault || false,
      isPublic: formValue.isPublic || false
    };

    if (this.isEditMode) {
      return {
        ...baseDto,
        concurrencyStamp: this.entity?.concurrencyStamp
      } as IdentityRoleUpdateDto;
    } else {
      return baseDto as IdentityRoleCreateDto;
    }
  }

  protected performSave(): void {
    const formValue = this.form.value;
    const dto = this.mapFormToDto(formValue);

    if (this.isEditMode) {
      // Actualizar rol y permisos
      this.updateRoleWithPermissions(dto as IdentityRoleUpdateDto);
    } else {
      // Crear rol y luego asignar permisos
      this.createRoleWithPermissions(dto as IdentityRoleCreateDto);
    }
  }

  /**
   * Override para cargar también los permisos del rol
   */
  protected override loadEntity(): void {
    if (!this.id) return;

    this.isLoading = true;
    this.service.get(this.id).subscribe({
      next: (entity) => {
        this.entity = entity;
        const formData = this.mapEntityToForm(entity);
        this.form.patchValue(formData);

        // Cargar permisos del rol
        this.loadRolePermissions(entity.name);

        this.updateToolbarConfig();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role:', error);
        this.toasterService.error('Error al cargar el rol');
        this.isLoading = false;
        this.router.navigate([this.config.listRoute]);
      }
    });
  }

  /**
   * Carga los permisos del rol
   */
  private loadRolePermissions(roleName: string): void {
    if (!roleName) {
      console.warn('Cannot load permissions without a role name');
      return;
    }

    this.loadingPermissions = true;

    this.permissionsService
      .get('R', roleName)
      .pipe(finalize(() => (this.loadingPermissions = false)))
      .subscribe({
        next: (response: any) => {
          this.permissionsData = response;
          console.log('Permissions loaded successfully:', response);
        },
        error: (error) => {
          console.error('Error loading role permissions:', error);
          this.toasterService.error('Error al cargar los permisos del rol');
        }
      });
  }

  /**
   * Crea un rol y guarda los permisos seleccionados
   */
  private createRoleWithPermissions(dto: IdentityRoleCreateDto): void {
    this.isLoading = true;

    this.service.create(dto).subscribe({
      next: (createdRole) => {
        // Si hay permisos seleccionados, guardarlos
        if (this.selectedPermissions.length > 0) {
          this.savePermissions(createdRole.name).subscribe({
            next: () => {
              this.isLoading = false;
              this.toasterService.success(`Rol "${createdRole.name}" creado exitosamente con ${this.selectedPermissions.length} permiso(s)`);
              this.router.navigate([this.config.listRoute]);
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error saving permissions:', error);
              this.toasterService.warn(`Rol "${createdRole.name}" creado, pero hubo un error al guardar los permisos`);
              this.router.navigate([this.config.listRoute]);
            }
          });
        } else {
          this.isLoading = false;
          this.toasterService.success(`Rol "${createdRole.name}" creado exitosamente`);
          this.router.navigate([this.config.listRoute]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating role:', error);
        this.toasterService.error('Error al crear el rol');
      }
    });
  }

  /**
   * Actualiza un rol y sus permisos
   */
  private updateRoleWithPermissions(dto: IdentityRoleUpdateDto): void {
    if (!this.id || !this.entity) return;

    this.isLoading = true;

    this.service.update(this.id, dto).subscribe({
      next: (updatedRole) => {
        // Después de actualizar el rol, guardar permisos
        this.savePermissions(updatedRole.name).subscribe({
          next: () => {
            this.isLoading = false;
            this.toasterService.success(`Rol "${updatedRole.name}" actualizado exitosamente`);
            this.router.navigate([this.config.listRoute]);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error saving permissions:', error);
            this.toasterService.warn(`Rol actualizado pero hubo un error al guardar permisos`);
            this.router.navigate([this.config.listRoute]);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating role:', error);
        this.toasterService.error('Error al actualizar el rol');
      }
    });
  }

  /**
   * Guarda los permisos del rol
   */
  private savePermissions(roleName: string): Observable<void> {
    if (!this.permissionTree) {
      // Si no hay árbol de permisos, retornar observable completo
      return of(undefined as void);
    }

    const selectedPermissions = this.permissionTree.getSelectedPermissions();

    // Construir el DTO para actualización
    const updateDto: UpdatePermissionsDto = {
      permissions: []
    };

    // Obtener todos los permisos disponibles
    if (this.permissionsData?.groups) {
      this.permissionsData.groups.forEach(group => {
        group.permissions.forEach(perm => {
          updateDto.permissions.push({
            name: perm.name,
            isGranted: selectedPermissions.includes(perm.name)
          });
        });
      });
    }

    // Guardar usando el servicio de permisos de ABP
    return this.permissionsService.update('R', roleName, updateDto as any);
  }

  /**
   * Maneja cambios en los permisos
   */
  onPermissionsChanged(selectedPermissions: string[]): void {
    this.selectedPermissions = selectedPermissions;
  }

  // Getters para acceso fácil a los controles
  get name() { return this.form.get('name'); }
  get isDefault() { return this.form.get('isDefault'); }
  get isPublic() { return this.form.get('isPublic'); }
}
