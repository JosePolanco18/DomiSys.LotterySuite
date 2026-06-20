import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { IdentityUserService, IdentityUserDto } from '@abp/ng.identity/proxy';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableColumn, TableAction } from '../../../shared/components/table/models/table.interface';
import { SharedModule } from '../../../shared/shared.module';
import { BaseListComponent, BaseListConfig } from '../../../shared/components/base-list/base-list.component';
import { DialogService } from 'primeng/dynamicdialog';
import { UserPermissionsComponent } from '../permissions/user-permissions.component';
import { UserResetPasswordComponent } from '../reset-password/user-reset-password.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  standalone: true,
  imports: [
    SharedModule,
    TableComponent,
    ToolbarComponent
  ],
  providers: [ListService, DialogService]
})
export class UserListComponent extends BaseListComponent<IdentityUserDto> implements OnInit {

  protected config: BaseListConfig = {
    entityName: 'Usuario',
    entityNamePlural: 'Usuarios',
    listRoute: '/identity/users',
    newRoute: '/identity/users/new',
    editRoute: '/identity/users/edit',
    searchPlaceholder: 'Buscar usuarios por nombre, email, nombre de usuario...',
    addButtonLabel: 'Nuevo usuario',
    permissions: {
      edit: 'AbpIdentity.Users.Update',
      delete: 'AbpIdentity.Users.Delete'
    }
  };

  protected service = this.userService;

  protected columns: TableColumn[] = [
    {
      field: 'userName',
      header: 'Nombre de usuario',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '200px',
      styleClass: 'text-primary fw-bold'
    },
    {
      field: 'email',
      header: 'Correo electrónico',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '250px'
    },
    {
      field: 'name',
      header: 'Nombre',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      field: 'surname',
      header: 'Apellido',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      field: 'phoneNumber',
      header: 'Teléfono',
      type: 'text',
      sortable: false,
      filterable: false,
      width: '150px'
    },
    {
      field: 'isActiveText',
      header: 'Estado',
      type: 'badge',
      sortable: false,
      filterable: false,
      width: '120px'
    }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private userService: IdentityUserService,
    private dialogService: DialogService
  ) {
    super(list, confirmationService, toasterService, router);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected override getSpecificActions(): TableAction[] {
    return [
      {
        label: 'Permisos',
        icon: 'pi pi-shield',
        onClick: (rowData: IdentityUserDto) => this.managePermissions(rowData),
        visible: () => this.hasPermission('AbpIdentity.Users.ManagePermissions')
      },
      {
        label: 'Resetear contraseña',
        icon: 'pi pi-key',
        onClick: (rowData: IdentityUserDto) => this.resetPassword(rowData),
        visible: () => this.hasPermission('AbpIdentity.Users.Update')
      },
      {
        label: 'Activar/Desactivar',
        icon: 'pi pi-power-off',
        onClick: (rowData: IdentityUserDto) => this.toggleActive(rowData),
        visible: () => this.hasPermission('AbpIdentity.Users.Update')
      }
    ];
  }

  protected override getEntityDisplayName(entity: IdentityUserDto): string {
    return entity.userName || entity.email || 'Usuario';
  }

  protected override getGlobalFilterFields(): string[] {
    return ['userName', 'email', 'name', 'surname', 'phoneNumber'];
  }

  protected override transformData(items: IdentityUserDto[]): IdentityUserDto[] {
    return items.map(item => ({
      ...item,
      isActiveText: item.isActive ? 'Activo' : 'Inactivo',
      lockoutEnabledText: item.lockoutEnabled ? 'Sí' : 'No'
    }));
  }

  /**
   * Abre el diálogo de gestión de permisos para un usuario
   */
  managePermissions(user: IdentityUserDto): void {
    const ref = this.dialogService.open(UserPermissionsComponent, {
      header: `Permisos - ${user.userName}`,
      width: '70vw',
      height: '80vh',
      data: {
        providerName: 'U',
        providerKey: user.id
      }
    });

    ref.onClose.subscribe((saved: boolean) => {
      if (saved) {
        this.toasterService.success('Permisos actualizados exitosamente');
      }
    });
  }

  /**
   * Abre el diálogo para resetear la contraseña de un usuario
   */
  resetPassword(user: IdentityUserDto): void {
    const ref = this.dialogService.open(UserResetPasswordComponent, {
      header: `Resetear contraseña - ${user.userName}`,
      width: '500px',
      data: {
        user: user
      }
    });

    ref.onClose.subscribe((saved: boolean) => {
      if (saved) {
        // No es necesario recargar la lista ya que solo se cambió la contraseña
        // pero podemos mostrar un mensaje adicional si se desea
      }
    });
  }

  /**
   * Activa o desactiva un usuario
   */
  toggleActive(user: IdentityUserDto): void {
    const isCurrentlyActive = user.isActive;
    const action = isCurrentlyActive ? 'desactivar' : 'activar';
    const message = `¿Está seguro de que quiere ${action} al usuario "${user.userName}"?`;

    this.confirmationService
      .warn(message, '¿Está seguro?')
      .subscribe((status) => {
        if (status === 'confirm') {

          const updateDto = {
            ...user,
            lockoutEnd: isCurrentlyActive ? new Date(2099, 11, 31) : null,
            concurrencyStamp: user.concurrencyStamp
          };

          updateDto.isActive = !user.isActive;
          this.userService.update(user.id!, updateDto as any).subscribe({
            next: () => {
              this.toasterService.success(`Usuario ${action} exitosamente`);
              this.list.get();
            },
            error: (error) => {
              this.toasterService.error(`Error al ${action} el usuario: ${error.message}`);
            }
          });
        }
      });
  }
}
