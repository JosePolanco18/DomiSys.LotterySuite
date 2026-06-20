import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { LoteriaService, SorteoService, ResultadoSorteoService, CrearResultadoSorteoDto } from 'src/app/proxy/loterias';

@Component({
  selector: 'app-resultado-sorteo-form',
  templateUrl: './resultado-sorteo-form.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormToolbarComponent, InputComponent, SelectComponent]
})
export class ResultadoSorteoFormComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Registrar Resultado',
    subtitle: 'Ingrese los números ganadores del sorteo',
    showBackButton: true,
    showSaveButton: true,
    saveButtonLabel: 'Registrar',
    showCancelButton: true,
    cancelButtonLabel: 'Cancelar',
    sticky: true,
    onSave: () => this.save(),
    onCancel: () => this.router.navigate(['/loterias/resultados']),
    buttons: []
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toasterService: ToasterService,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService,
    private resultadoService: ResultadoSorteoService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      loteriaId: ['', Validators.required],
      sorteoId: ['', Validators.required],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      primera: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      segunda: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      tercera: [null, [Validators.required, Validators.min(0), Validators.max(99)]]
    });
  }

  save(): void {
    if (!this.form.valid) return;
    this.isLoading = true;

    const input: CrearResultadoSorteoDto = {
      sorteoId: this.form.value.sorteoId,
      fecha: this.form.value.fecha instanceof Date ? this.form.value.fecha.toISOString().split('T')[0] : String(this.form.value.fecha).split('T')[0],
      primera: this.form.value.primera,
      segunda: this.form.value.segunda,
      tercera: this.form.value.tercera
    };

    this.resultadoService.registrar(input).subscribe({
      next: () => {
        this.toasterService.success('Resultado registrado y ganadores calculados');
        this.router.navigate(['/loterias/resultados']);
      },
      error: () => this.isLoading = false
    });
  }
}
