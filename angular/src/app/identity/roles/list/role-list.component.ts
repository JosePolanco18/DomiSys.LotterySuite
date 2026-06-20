import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { IdentityRoleService, IdentityRoleDto } from '@abp/ng.identity/proxy';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableColumn, TableAction } from '../../../shared/components/table/models/table.interface';
import { SharedModule } from '../../../shared/shared.module';
import { BaseListComponent, BaseListConfig } from '../../../shared/components/base-list/base-list.component';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  standalone: true,
  imports: [
    SharedModule,
    TableComponent,
    ToolbarComponent
  ],
  providers: [ListService]
})
export class RoleListComponent extends BaseListComponent<IdentityRoleDto> implements OnInit {

  protected config: BaseListConfig = {
    entityName: 'Rol',
    entityNamePlural: 'Roles',
    listRoute: '/identity/roles',
    newRoute: '/identity/roles/new',
    editRoute: '/identity/roles/edit',
    searchPlaceholder: 'Buscar roles por nombre...',
    addButtonLabel: 'Nuevo rol',
    permissions: {
      edit: 'AbpIdentity.Roles.Update',
      delete: 'AbpIdentity.Roles.Delete'
    }
  };

  protected service = this.roleService;

  protected columns: TableColumn[] = [
    {
      field: 'name',
      header: 'Nombre del rol',
      type: 'text',
      sortable: true,
      filterable: true,
      styleClass: 'text-primary fw-bold'
    },
    {
      field: 'isDefaultText',
      header: 'Rol por defecto',
      type: 'badge',
      sortable: false,
      filterable: false,
    },
    {
      field: 'isPublicText',
      header: 'Rol público',
      type: 'badge',
      sortable: false,
      filterable: false,
    }
  ];

  constructor(
    public override readonly list: ListService,
    protected override confirmationService: ConfirmationService,
    protected override toasterService: ToasterService,
    protected override router: Router,
    private roleService: IdentityRoleService
  ) {
    super(list, confirmationService, toasterService, router);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected override getSpecificActions(): TableAction[] {
    return [];
  }

  protected override getEntityDisplayName(entity: IdentityRoleDto): string {
    return entity.name || 'Rol';
  }

  protected override getGlobalFilterFields(): string[] {
    return ['name'];
  }

  protected override transformData(items: IdentityRoleDto[]): IdentityRoleDto[] {
    return items.map(item => ({
      ...item,
      isDefaultText: item.isDefault ? 'Sí' : 'No',
      isPublicText: item.isPublic ? 'Sí' : 'No'
    }));
  }

  /**
   * Override del método delete para prevenir eliminación de roles de sistema
   */
  override delete(id: string, name: string): void {
    // Verificar si es un rol de sistema (admin, etc.)
    const systemRoles = ['admin', 'administrator'];
    if (systemRoles.includes(name.toLowerCase())) {
      this.toasterService.warn('No se puede eliminar un rol de sistema');
      return;
    }

    super.delete(id, name);
  }
}
