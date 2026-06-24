import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { ConfiguracionService, ConfiguracionGeneralDto } from 'src/app/proxy/configuracion';

@Component({
  selector: 'app-configuracion-general',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule, FormToolbarComponent, InputComponent],
  template: `
    <app-form-toolbar [config]="formToolbarConfig"></app-form-toolbar>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card card-flush">
          <div class="card-header border-0 pt-6">
            <div class="card-title">
              <span class="text-gray-800 fw-bold fs-5">Configuracion General</span>
            </div>
          </div>
          <div class="card-body pt-2" *ngIf="form">
            <form [formGroup]="form">
              <div class="row">
                <div class="col-md-6">
                  <app-input label="Comision Venta por Defecto (%)" type="number" formControlName="comisionVentaPorDefecto" [required]="true" [min]="0" [max]="100"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Comision Verde por Defecto (%)" type="number" formControlName="comisionVerdePorDefecto" [required]="true" [min]="0" [max]="100"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Minutos Ventana de Anulacion" type="number" formControlName="minutosVentanaAnulacion" [required]="true" [min]="0"></app-input>
                </div>
                <div class="col-md-6">
                  <div class="form-check form-switch mt-8">
                    <input class="form-check-input" type="checkbox" formControlName="vendedorPuedeAnular" id="vendedorPuedeAnular">
                    <label class="form-check-label fw-semibold text-gray-800" for="vendedorPuedeAnular">Vendedor puede anular</label>
                  </div>
                </div>
              </div>
              <div class="separator my-5"></div>
              <h5 class="text-gray-600 fw-bold mb-4">Datos para Tickets</h5>
              <div class="row">
                <div class="col-md-6">
                  <app-input label="Nombre de Empresa" type="text" formControlName="nombreEmpresa" [required]="true" placeholder="Ej: DomiSys Lottery"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Telefono" type="text" formControlName="telefonoEmpresa" placeholder="Ej: 809-555-1234"></app-input>
                </div>
                <div class="col-md-12">
                  <app-input label="Pie de Ticket" type="text" formControlName="pieTicket" placeholder="Ej: Conserve este ticket" helperText="Texto que aparece al final del ticket impreso"></app-input>
                </div>
              </div>
              <div class="separator my-5"></div>
              <h5 class="text-gray-600 fw-bold mb-4">Limites por Tipo de Jugada</h5>
              <div class="row">
                <div class="col-md-6">
                  <app-input label="Limite Quiniela (RD$)" type="number" formControlName="limiteQuiniela" [min]="0" placeholder="Sin limite"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Limite Pale (RD$)" type="number" formControlName="limitePale" [min]="0" placeholder="Sin limite"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Limite Tripleta (RD$)" type="number" formControlName="limiteTripleta" [min]="0" placeholder="Sin limite"></app-input>
                </div>
                <div class="col-md-6">
                  <app-input label="Limite Super Pale (RD$)" type="number" formControlName="limiteSuperPale" [min]="0" placeholder="Sin limite"></app-input>
                </div>
              </div>
              <div class="separator my-5"></div>
              <button class="btn btn-primary" (click)="guardar()" [disabled]="isSaving || !form.valid">
                <i class="fas fa-save me-2"></i>{{ isSaving ? 'Guardando...' : 'Guardar' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfiguracionGeneralComponent implements OnInit {
  form!: FormGroup;
  isSaving = false;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Configuracion General',
    subtitle: 'Ajustes globales del sistema',
    showSaveButton: false,
    showCancelButton: false,
    sticky: true,
    buttons: []
  };

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      comisionVentaPorDefecto: [7, [Validators.required, Validators.min(0), Validators.max(100)]],
      comisionVerdePorDefecto: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      minutosVentanaAnulacion: [5, [Validators.required, Validators.min(0)]],
      vendedorPuedeAnular: [true],
      nombreEmpresa: ['DomiSys Lottery', Validators.required],
      telefonoEmpresa: [''],
      pieTicket: ['Conserve este ticket'],
      limiteQuiniela: [null],
      limitePale: [null],
      limiteTripleta: [null],
      limiteSuperPale: [null]
    });

    this.configuracionService.obtener().subscribe(config => {
      this.form.patchValue(config);
    });
  }

  guardar(): void {
    if (!this.form.valid) return;
    this.isSaving = true;
    const input: ConfiguracionGeneralDto = this.form.value;
    this.configuracionService.actualizar(input).subscribe({
      next: (result) => {
        this.form.patchValue(result);
        this.toasterService.success('Configuracion guardada');
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
