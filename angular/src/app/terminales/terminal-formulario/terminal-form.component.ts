import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { BaseFormComponent, BaseFormConfig } from 'src/app/shared/components/base-form/base-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { TerminalDto, CrearActualizarTerminalDto, TerminalService } from 'src/app/proxy/terminales';

@Component({
  selector: 'app-terminal-form',
  templateUrl: './terminal-form.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormToolbarComponent, InputComponent]
})
export class TerminalFormComponent extends BaseFormComponent<TerminalDto, CrearActualizarTerminalDto> {
  protected config: BaseFormConfig = {
    entityName: 'Terminal',
    entityNamePlural: 'Terminales',
    listRoute: '/terminales'
  };

  protected service = {
    get: (id: string) => this.terminalService.get(id),
    create: (input: CrearActualizarTerminalDto) => this.terminalService.create(input),
    update: (id: string, input: CrearActualizarTerminalDto) => this.terminalService.update(id, input)
  };

  constructor(
    fb: FormBuilder,
    route: ActivatedRoute,
    router: Router,
    toasterService: ToasterService,
    private terminalService: TerminalService
  ) {
    super(fb, route, router, toasterService);
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      nombreVendedor: ['', [Validators.required, Validators.maxLength(200)]],
      pin: [''],
      porcentajeComisionVenta: [null],
      porcentajeComisionVerde: [null],
      ubicacion: [''],
      telefono: [''],
      notas: [''],
      limiteVentaDiaria: [null],
      limiteCuadre: [null],
      puedePagarGanadores: [false]
    });
  }

  protected getEntityDisplayName(entity: TerminalDto): string {
    return `${entity.codigo} - ${entity.nombre}`;
  }

  protected mapEntityToForm(entity: TerminalDto): any {
    return {
      codigo: entity.codigo,
      nombre: entity.nombre,
      nombreVendedor: entity.nombreVendedor,
      porcentajeComisionVenta: entity.porcentajeComisionVenta,
      porcentajeComisionVerde: entity.porcentajeComisionVerde,
      ubicacion: entity.ubicacion,
      telefono: entity.telefono,
      notas: entity.notas,
      limiteVentaDiaria: entity.limiteVentaDiaria,
      limiteCuadre: entity.limiteCuadre,
      puedePagarGanadores: entity.puedePagarGanadores
    };
  }

  protected mapFormToDto(formValue: any): CrearActualizarTerminalDto {
    return formValue as CrearActualizarTerminalDto;
  }

  protected performSave(): void {
    const dto = this.mapFormToDto(this.form.value);
    if (this.isEditMode) {
      this.updateEntity(dto);
    } else {
      this.createEntity(dto);
    }
  }
}
