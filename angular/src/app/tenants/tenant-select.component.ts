import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh; background: #f5f8fa;">
      <div class="card shadow-sm" style="width: 400px;">
        <div class="card-body text-center p-5">
          <i class="fas fa-building text-primary mb-3" style="font-size: 48px;"></i>
          <h3 class="mb-1">DomiSys LotterySuite</h3>
          <p class="text-muted mb-4">Ingrese el identificador de su banca para continuar</p>

          <div class="mb-3 text-start">
            <label class="form-label fw-semibold">Nombre de Banca (Tenant)</label>
            <input type="text" class="form-control form-control-lg" [(ngModel)]="tenantName"
                   placeholder="Ej: BK1 (vacio = Administrador Host)"
                   style="text-transform: uppercase"
                   (keyup.enter)="continuar()">
            <small class="text-muted">Deje vacio para ingresar como administrador del sistema</small>
          </div>

          <button class="btn btn-primary btn-lg w-100" (click)="continuar()">
            Continuar
          </button>

          <div class="mt-3" *ngIf="savedTenant">
            <small class="text-muted">Ultimo tenant: <strong>{{ savedTenant }}</strong></small>
            <a href="javascript:void(0)" class="ms-2 small" (click)="usarGuardado()">Usar este</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TenantSelectComponent implements OnInit {
  tenantName = '';
  savedTenant: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.savedTenant = localStorage.getItem('__tenant');
    if (this.savedTenant) {
      this.tenantName = this.savedTenant;
    }
  }

  continuar(): void {
    const name = this.tenantName.trim().toUpperCase();
    if (name) {
      localStorage.setItem('__tenant', name);
    } else {
      localStorage.removeItem('__tenant');
    }
    window.location.href = '/';
  }

  usarGuardado(): void {
    this.tenantName = this.savedTenant || '';
    this.continuar();
  }
}
