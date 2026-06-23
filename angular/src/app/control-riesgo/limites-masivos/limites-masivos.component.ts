import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { LimiteNumeroService } from 'src/app/proxy/control-riesgo';
import { LoteriaService, SorteoService } from 'src/app/proxy/loterias';

@Component({
  selector: 'app-limites-masivos',
  templateUrl: './limites-masivos.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, InputComponent, SelectComponent]
})
export class LimitesMasivosComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private limiteService: LimiteNumeroService,
    private toasterService: ToasterService,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      loteriaId: [''],
      sorteoId: [''],
      limiteVentaMaximo: [null, [Validators.required, Validators.min(1)]],
      limiteAguante: [null, [Validators.required, Validators.min(0)]]
    });
  }

  aplicar(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    this.limiteService.asignarMasivos({
      loteriaId: val.loteriaId || undefined,
      sorteoId: val.sorteoId || undefined,
      limiteVentaMaximo: val.limiteVentaMaximo,
      limiteAguante: val.limiteAguante
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toasterService.success(
          `Se procesaron ${res.total} registros (${res.creados} creados, ${res.actualizados} actualizados)`,
          'Limites Asignados'
        );
      },
      error: () => {
        this.loading = false;
        this.toasterService.error('Error al asignar limites masivos');
      }
    });
  }
}
