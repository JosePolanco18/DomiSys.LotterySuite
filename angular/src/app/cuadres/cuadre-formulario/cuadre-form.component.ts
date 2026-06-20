import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { TerminalService } from 'src/app/proxy/terminales';
import { CuadreTerminalDto, CuadreService, GenerarCuadreDto } from 'src/app/proxy/cuadres';

@Component({
  selector: 'app-cuadre-form',
  templateUrl: './cuadre-form.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule, FormToolbarComponent, InputComponent, SelectComponent]
})
export class CuadreFormComponent implements OnInit {
  form!: FormGroup;
  resumen: CuadreTerminalDto | null = null;
  isLoading = false;

  formToolbarConfig: FormToolbarConfig = {
    title: 'Generar Cuadre',
    subtitle: 'Seleccione la terminal para generar el cuadre',
    showBackButton: true,
    showSaveButton: true,
    saveButtonLabel: 'Generar Cuadre',
    showCancelButton: true,
    cancelButtonLabel: 'Cancelar',
    sticky: true,
    onSave: () => this.generarCuadre(),
    onCancel: () => this.router.navigate(['/cuadres']),
    buttons: []
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toasterService: ToasterService,
    public terminalService: TerminalService,
    private cuadreService: CuadreService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      terminalId: ['', Validators.required],
      notas: ['']
    });

    // Listen for terminal selection changes to load resumen
    this.form.get('terminalId')?.valueChanges.subscribe(terminalId => {
      if (terminalId) {
        this.cuadreService.getResumenTerminal(terminalId).subscribe(resumen => this.resumen = resumen);
      } else {
        this.resumen = null;
      }
    });
  }

  generarCuadre(): void {
    if (!this.form.valid) return;
    this.isLoading = true;

    const input: GenerarCuadreDto = {
      terminalId: this.form.value.terminalId,
      notas: this.form.value.notas
    };

    this.cuadreService.generar(input).subscribe({
      next: () => {
        this.toasterService.success('Cuadre generado exitosamente');
        this.router.navigate(['/cuadres']);
      },
      error: () => this.isLoading = false
    });
  }
}
