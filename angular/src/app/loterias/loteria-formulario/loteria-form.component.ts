import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToasterService, ConfirmationService } from '@abp/ng.theme.shared';
import { BaseFormComponent, BaseFormConfig } from 'src/app/shared/components/base-form/base-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { LoteriaDto, CrearActualizarLoteriaDto, SorteoDto, CrearActualizarSorteoDto, LoteriaService, SorteoService, ConfiguracionPagoSorteoDto, CrearActualizarConfiguracionPagoSorteoDto, ConfiguracionPagoSorteoService } from 'src/app/proxy/loterias';

@Component({
  selector: 'app-loteria-form',
  templateUrl: './loteria-form.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule, FormToolbarComponent, InputComponent]
})
export class LoteriaFormComponent extends BaseFormComponent<LoteriaDto, CrearActualizarLoteriaDto> {
  protected config: BaseFormConfig = {
    entityName: 'Lotería',
    entityNamePlural: 'Loterías',
    listRoute: '/loterias'
  };

  protected service = {
    get: (id: string) => this.loteriaService.getConSorteos(id),
    create: (input: CrearActualizarLoteriaDto) => this.loteriaService.create(input),
    update: (id: string, input: CrearActualizarLoteriaDto) => this.loteriaService.update(id, input)
  };

  sorteos: SorteoDto[] = [];
  sorteoForm!: FormGroup;
  editingSorteoId: string | null = null;
  showSorteoForm = false;

  // Pago config
  pagosForm!: FormGroup;
  editingPagosSorteoId: string | null = null;
  editingPagosSorteoNombre: string = '';
  showPagosForm = false;

  diasSemana = [
    { key: 'L', label: 'Lun' },
    { key: 'M', label: 'Mar' },
    { key: 'Mi', label: 'Mié' },
    { key: 'J', label: 'Jue' },
    { key: 'V', label: 'Vie' },
    { key: 'S', label: 'Sáb' },
    { key: 'D', label: 'Dom' }
  ];

  constructor(
    fb: FormBuilder,
    route: ActivatedRoute,
    router: Router,
    toasterService: ToasterService,
    private loteriaService: LoteriaService,
    private sorteoService: SorteoService,
    private confirmationService: ConfirmationService,
    private configPagoSorteoService: ConfiguracionPagoSorteoService
  ) {
    super(fb, route, router, toasterService);
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigoCorto: ['', [Validators.required, Validators.maxLength(10)]],
      logoUrl: [''],
      activa: [true],
      orden: [0, [Validators.required]]
    });
    this.initSorteoForm();
  }

  private initSorteoForm(): void {
    this.sorteoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      horaAperturaVentas: ['', Validators.required],
      horaCierreVentas: ['', Validators.required],
      horaSorteo: ['', Validators.required],
      minutosEsperaScraping: [15, [Validators.required, Validators.min(0)]],
      activo: [true],
      // ponytail: dias as individual booleans, joined to string on save
      diaL: [true], diaM: [true], diaMi: [true], diaJ: [true], diaV: [true], diaS: [true], diaD: [false]
    });
  }

  override loadEntity(): void {
    this.service.get(this.id!).subscribe(entity => {
      this.entity = entity;
      this.form.patchValue(this.mapEntityToForm(entity));
      this.sorteos = entity.sorteos || [];
      this.updateToolbarConfig();
    });
  }

  protected getEntityDisplayName(entity: LoteriaDto): string {
    return entity.nombre || '';
  }

  protected mapEntityToForm(entity: LoteriaDto): any {
    return {
      nombre: entity.nombre,
      codigoCorto: entity.codigoCorto,
      logoUrl: entity.logoUrl,
      activa: entity.activa,
      orden: entity.orden
    };
  }

  protected mapFormToDto(formValue: any): CrearActualizarLoteriaDto {
    return formValue as CrearActualizarLoteriaDto;
  }

  protected performSave(): void {
    const dto = this.mapFormToDto(this.form.value);
    if (this.isEditMode) {
      this.updateEntity(dto);
    } else {
      this.createEntity(dto);
    }
  }

  // ===== SORTEO MANAGEMENT =====

  nuevoSorteo(): void {
    this.editingSorteoId = null;
    this.sorteoForm.reset({ minutosEsperaScraping: 15, activo: true, diaL: true, diaM: true, diaMi: true, diaJ: true, diaV: true, diaS: true, diaD: false });
    this.showSorteoForm = true;
  }

  editarSorteo(sorteo: SorteoDto): void {
    this.editingSorteoId = sorteo.id!;
    const dias = (sorteo.diasActivos || '').split(',');
    this.sorteoForm.patchValue({
      nombre: sorteo.nombre,
      horaAperturaVentas: sorteo.horaAperturaVentas,
      horaCierreVentas: sorteo.horaCierreVentas,
      horaSorteo: sorteo.horaSorteo,
      minutosEsperaScraping: sorteo.minutosEsperaScraping,
      activo: sorteo.activo,
      diaL: dias.includes('L'), diaM: dias.includes('M'), diaMi: dias.includes('Mi'),
      diaJ: dias.includes('J'), diaV: dias.includes('V'), diaS: dias.includes('S'), diaD: dias.includes('D')
    });
    this.showSorteoForm = true;
  }

  cancelarSorteo(): void {
    this.showSorteoForm = false;
    this.editingSorteoId = null;
  }

  guardarSorteo(): void {
    if (!this.sorteoForm.valid) return;
    const v = this.sorteoForm.value;

    const diasActivos = this.diasSemana
      .filter(d => v['dia' + d.key])
      .map(d => d.key)
      .join(',');

    const dto: CrearActualizarSorteoDto = {
      loteriaId: this.id!,
      nombre: v.nombre,
      diasActivos,
      horaAperturaVentas: v.horaAperturaVentas,
      horaCierreVentas: v.horaCierreVentas,
      horaSorteo: v.horaSorteo,
      minutosEsperaScraping: v.minutosEsperaScraping,
      activo: v.activo
    };

    const obs$ = this.editingSorteoId
      ? this.sorteoService.update(this.editingSorteoId, dto)
      : this.sorteoService.create(dto);

    obs$.subscribe({
      next: () => {
        this.toasterService.success(this.editingSorteoId ? 'Sorteo actualizado' : 'Sorteo creado');
        this.showSorteoForm = false;
        this.editingSorteoId = null;
        this.reloadSorteos();
      }
    });
  }

  eliminarSorteo(sorteo: SorteoDto): void {
    this.confirmationService.warn('¿Eliminar este sorteo?', 'Confirmar').subscribe(result => {
      if (result === 'confirm') {
        this.sorteoService.delete(sorteo.id!).subscribe(() => {
          this.toasterService.success('Sorteo eliminado');
          this.reloadSorteos();
        });
      }
    });
  }

  private reloadSorteos(): void {
    this.sorteoService.getPorLoteria(this.id!).subscribe(s => this.sorteos = s);
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    // ABP returns TimeSpan as "HH:mm:ss", display "HH:mm"
    return time.substring(0, 5);
  }

  // ===== PAGOS (ConfiguracionPagoSorteo) =====

  configurarPagos(sorteo: SorteoDto): void {
    this.editingPagosSorteoId = sorteo.id!;
    this.editingPagosSorteoNombre = sorteo.nombre || '';
    this.pagosForm = this.fb.group({
      quinielaPrimera: [60, Validators.required],
      quinielaSegunda: [40, Validators.required],
      quinielaTercera: [20, Validators.required],
      palePrimeraSegunda: [1000, Validators.required],
      paleSegundaTercera: [500, Validators.required],
      tripleta: [100000, Validators.required],
      superPale: [1000, Validators.required]
    });
    this.showPagosForm = true;

    this.configPagoSorteoService.getPorSorteo(sorteo.id!).subscribe(config => {
      this.pagosForm.patchValue({
        quinielaPrimera: config.quinielaPrimera,
        quinielaSegunda: config.quinielaSegunda,
        quinielaTercera: config.quinielaTercera,
        palePrimeraSegunda: config.palePrimeraSegunda,
        paleSegundaTercera: config.paleSegundaTercera,
        tripleta: config.tripleta,
        superPale: config.superPale
      });
    });
  }

  cancelarPagos(): void {
    this.showPagosForm = false;
    this.editingPagosSorteoId = null;
  }

  guardarPagos(): void {
    if (!this.pagosForm.valid || !this.editingPagosSorteoId) return;
    const v = this.pagosForm.value;
    const dto: CrearActualizarConfiguracionPagoSorteoDto = {
      sorteoId: this.editingPagosSorteoId,
      quinielaPrimera: v.quinielaPrimera,
      quinielaSegunda: v.quinielaSegunda,
      quinielaTercera: v.quinielaTercera,
      palePrimeraSegunda: v.palePrimeraSegunda,
      paleSegundaTercera: v.paleSegundaTercera,
      tripleta: v.tripleta,
      superPale: v.superPale
    };
    this.configPagoSorteoService.actualizar(this.editingPagosSorteoId, dto).subscribe({
      next: () => {
        this.toasterService.success('Pagos actualizados');
        this.showPagosForm = false;
        this.editingPagosSorteoId = null;
      }
    });
  }
}
