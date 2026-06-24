import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToasterService, ConfirmationService } from '@abp/ng.theme.shared';
import { TenantService, TenantDto, CreateUpdateTenantDto } from 'src/app/proxy/tenants';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Gestion de Bancas (Tenants)</h4>
        <button class="btn btn-primary btn-sm" (click)="openCreate()">
          <i class="fas fa-plus me-1"></i> Nueva Banca
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Codigo de Banca</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tenants">
                <td>
                  <span class="fw-bold">{{ t.name }}</span>
                </td>
                <td>
                  <span class="badge bg-success">Activa</span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteTenant(t)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="tenants.length === 0">
                <td colspan="3" class="text-center text-muted py-4">No hay bancas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva Banca</h5>
            <button type="button" class="btn-close" (click)="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Codigo de Banca <small class="text-muted">(identificador unico, ej: BK1)</small></label>
              <input type="text" class="form-control" [(ngModel)]="newTenant.name" maxlength="15" style="text-transform: uppercase" placeholder="BK1">
            </div>
            <div class="mb-3">
              <label class="form-label">Email del Administrador</label>
              <input type="email" class="form-control" [(ngModel)]="newTenant.adminEmailAddress" placeholder="admin@banca.com">
            </div>
            <div class="mb-3">
              <label class="form-label">Password del Administrador</label>
              <input type="password" class="form-control" [(ngModel)]="newTenant.adminPassword" placeholder="****">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" (click)="showModal = false">Cancelar</button>
            <button class="btn btn-primary" (click)="createTenant()" [disabled]="saving || !newTenant.name">
              {{ saving ? 'Creando...' : 'Crear Banca' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showModal"></div>
  `
})
export class TenantListComponent implements OnInit {
  tenants: TenantDto[] = [];
  showModal = false;
  saving = false;
  newTenant: CreateUpdateTenantDto = { name: '', adminEmailAddress: '', adminPassword: '' };

  constructor(
    private tenantService: TenantService,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.tenantService.getList({ maxResultCount: 100, skipCount: 0 }).subscribe(res => {
      this.tenants = res.items || [];
    });
  }

  openCreate(): void {
    this.newTenant = { name: '', adminEmailAddress: '', adminPassword: '' };
    this.showModal = true;
  }

  createTenant(): void {
    this.saving = true;
    this.newTenant.name = this.newTenant.name.toUpperCase();
    this.tenantService.create(this.newTenant).subscribe({
      next: () => {
        this.toasterService.success(`Banca "${this.newTenant.name}" creada`);
        this.showModal = false;
        this.saving = false;
        this.loadTenants();
      },
      error: () => {
        this.toasterService.error('Error al crear banca');
        this.saving = false;
      }
    });
  }

  deleteTenant(t: TenantDto): void {
    this.confirmationService.warn(`Eliminar banca "${t.name}"?`, 'Confirmar').subscribe(result => {
      if (result === 'confirm') {
        this.tenantService.delete(t.id).subscribe(() => {
          this.toasterService.success('Banca eliminada');
          this.loadTenants();
        });
      }
    });
  }
}
