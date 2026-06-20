import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { LoteriaService, SorteoService } from 'src/app/proxy/loterias';
import { AcumuladoVentaNumeroDto, LimiteNumeroService } from 'src/app/proxy/control-riesgo';

@Component({
  selector: 'app-monitor-limites',
  templateUrl: './monitor-limites.component.html',
  standalone: true,
  imports: [SharedModule, CommonModule, ReactiveFormsModule, FormToolbarComponent, InputComponent, SelectComponent]
})
export class MonitorLimitesComponent implements OnInit {
  filterForm!: FormGroup;
  acumulados: AcumuladoVentaNumeroDto[] = [];
  isLoading = false;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Monitor de Ventas por Número',
    subtitle: 'Acumulados en tiempo real',
    showSaveButton: false,
    showCancelButton: false,
    sticky: true,
    buttons: []
  };

  constructor(
    private fb: FormBuilder,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService,
    private limiteService: LimiteNumeroService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      loteriaId: [''],
      sorteoId: [''],
      fecha: [new Date().toISOString().split('T')[0]]
    });
  }

  private toIsoDate(val: any): string {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return String(val).split('T')[0];
  }

  consultar(): void {
    const sorteoId = this.filterForm.get('sorteoId')?.value;
    const fecha = this.toIsoDate(this.filterForm.get('fecha')?.value);
    if (!sorteoId || !fecha) return;
    this.isLoading = true;
    this.limiteService.getAcumulados(sorteoId, fecha).subscribe({
      next: (data) => {
        this.acumulados = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getPorcentajeUso(item: AcumuladoVentaNumeroDto): number {
    if (item.limiteVentaMaximo <= 0) return 0;
    return (item.montoAcumulado / item.limiteVentaMaximo) * 100;
  }

  getBarClass(item: AcumuladoVentaNumeroDto): string {
    const pct = this.getPorcentajeUso(item);
    if (pct >= 90) return 'bg-danger';
    if (pct >= 70) return 'bg-warning';
    return 'bg-success';
  }
}
