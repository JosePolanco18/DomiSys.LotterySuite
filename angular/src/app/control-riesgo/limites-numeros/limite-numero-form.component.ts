import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { BaseFormComponent, BaseFormConfig } from 'src/app/shared/components/base-form/base-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { LimiteNumeroDto, CrearActualizarLimiteNumeroDto, LimiteNumeroService } from 'src/app/proxy/control-riesgo';
import { LoteriaService, SorteoService } from 'src/app/proxy/loterias';

@Component({
  selector: 'app-limite-numero-form',
  templateUrl: './limite-numero-form.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormToolbarComponent, InputComponent, SelectComponent]
})
export class LimiteNumeroFormComponent extends BaseFormComponent<LimiteNumeroDto, CrearActualizarLimiteNumeroDto> {
  protected config: BaseFormConfig = {
    entityName: 'Límite',
    entityNamePlural: 'Límites',
    listRoute: '/control-riesgo/limites'
  };

  protected service = {
    get: (id: string) => this.limiteService.get(id),
    create: (input: CrearActualizarLimiteNumeroDto) => this.limiteService.create(input),
    update: (id: string, input: CrearActualizarLimiteNumeroDto) => this.limiteService.update(id, input)
  };

  constructor(
    fb: FormBuilder,
    route: ActivatedRoute,
    router: Router,
    toasterService: ToasterService,
    private limiteService: LimiteNumeroService,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService
  ) {
    super(fb, route, router, toasterService);
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      loteriaId: ['', Validators.required],
      sorteoId: ['', Validators.required],
      numero: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      limiteVentaMaximo: [null, [Validators.required, Validators.min(0)]],
      limiteAguante: [null, [Validators.required, Validators.min(0)]],
      bloqueado: [false],
      notas: ['']
    });
  }

  protected getEntityDisplayName(entity: LimiteNumeroDto): string {
    return `${entity.nombreLoteria} - #${entity.numero}`;
  }

  protected mapEntityToForm(entity: LimiteNumeroDto): any {
    return {
      loteriaId: entity.loteriaId,
      sorteoId: entity.sorteoId,
      numero: entity.numero,
      limiteVentaMaximo: entity.limiteVentaMaximo,
      limiteAguante: entity.limiteAguante,
      bloqueado: entity.bloqueado,
      notas: entity.notas
    };
  }

  protected mapFormToDto(formValue: any): CrearActualizarLimiteNumeroDto {
    return formValue as CrearActualizarLimiteNumeroDto;
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
