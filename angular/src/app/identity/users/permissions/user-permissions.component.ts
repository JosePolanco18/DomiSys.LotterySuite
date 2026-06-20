import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '@abp/ng.theme.shared';
import { PermissionTreeComponent } from '../../shared/components/permission-tree/permission-tree.component';
import { UpdatePermissionsDto } from '../../models/permission-tree.model';
import { PermissionsService, GetPermissionListResultDto } from '@abp/ng.permission-management/proxy';
import { finalize } from 'rxjs/operators';

/**
 * Componente para gestionar permisos de un usuario específico
 * Se abre como diálogo desde UserListComponent
 */
@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PermissionTreeComponent
  ]
})
export class UserPermissionsComponent implements OnInit {
  @ViewChild(PermissionTreeComponent) permissionTree?: PermissionTreeComponent;

  /**
   * Provider name (U = User, R = Role)
   */
  providerName = '';

  /**
   * Provider key (User ID o Role Name)
   */
  providerKey = '';

  /**
   * Datos de permisos cargados del servidor
   */
  permissionsData?: GetPermissionListResultDto;

  /**
   * Indica si está cargando permisos
   */
  loading = false;

  /**
   * Indica si está guardando cambios
   */
  saving = false;

  constructor(
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private permissionsService: PermissionsService,
    private toasterService: ToasterService
  ) {
    // Obtener parámetros del diálogo
    if (this.config.data) {
      this.providerName = this.config.data.providerName || 'U';
      this.providerKey = this.config.data.providerKey || '';
    }
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  /**
   * Carga los permisos del usuario desde el servidor
   */
  loadPermissions(): void {
    if (!this.providerKey) {
      this.toasterService.error('No se especificó el usuario');
      this.close(false);
      return;
    }

    this.loading = true;

    // Usar el servicio de permisos de ABP
    this.permissionsService
      .get(this.providerName, this.providerKey)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          this.permissionsData = response;
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          this.toasterService.error('Error al cargar los permisos');
          this.close(false);
        }
      });
  }

  /**
   * Guarda los cambios de permisos
   */
  save(): void {
    if (!this.permissionTree) {
      this.toasterService.error('Error al obtener los permisos seleccionados');
      return;
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

    this.saving = true;

    // Guardar usando el servicio de permisos de ABP
    this.permissionsService
      .update(this.providerName, this.providerKey, updateDto as any)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.toasterService.success('Permisos actualizados exitosamente');
          this.close(true);
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          this.toasterService.error('Error al guardar los permisos');
        }
      });
  }

  /**
   * Cierra el diálogo
   */
  close(saved: boolean = false): void {
    this.ref.close(saved);
  }

  /**
   * Maneja cambios en los permisos
   */
  onPermissionsChanged(selectedPermissions: string[]): void {
    // Aquí puedes hacer algo cuando cambian los permisos
    // Por ejemplo, validar o mostrar información adicional
    console.log('Permisos cambiados:', selectedPermissions);
  }
}
