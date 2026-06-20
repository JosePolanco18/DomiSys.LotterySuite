import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../input/input.component';
import { SelectComponent } from '../../select/select.component';
import { FormToolbarComponent } from '../../form-toolbar/form-toolbar.component';
import { FormToolbarConfig, FormToolbarButton } from '../../form-toolbar/models/form-toolbar.interface';
import { ReportFieldConfig, ReportParametersConfig, ReportToolbarConfig } from '../models/report.interface';

@Component({
  selector: 'app-report-parameters',
  templateUrl: './report-parameters.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    FormToolbarComponent
  ]
})
export class ReportParametersComponent implements OnInit {
  @Input() config!: ReportParametersConfig;
  @Input() toolbarConfig!: ReportToolbarConfig;
  @Input() loading = false;
  @Input() initialValues: any = {};

  @Output() parametersSubmit = new EventEmitter<any>();
  @Output() parametersReset = new EventEmitter<void>();
  @Output() exitReport = new EventEmitter<void>();

  form!: FormGroup;
  formToolbarConfig!: FormToolbarConfig;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.setupToolbarConfig();
  }

  private buildForm(): void {
    const formConfig: any = {};

    this.config.fields.forEach(field => {
      if (field.type === 'dateRange') {
        formConfig[`${field.name}From`] = [this.initialValues[`${field.name}From`] || null];
        formConfig[`${field.name}To`] = [this.initialValues[`${field.name}To`] || null];
      } else {
        formConfig[field.name] = [
          this.initialValues[field.name] || field.defaultValue || null
        ];
      }
    });

    this.form = this.fb.group(formConfig);
  }

  private setupToolbarConfig(): void {
    this.formToolbarConfig = {
      title: this.toolbarConfig.title || 'Reporte',
      subtitle: this.toolbarConfig.subtitle,
      showBackButton: this.toolbarConfig.showBackButton || false,
      showSaveButton: false,
      showCancelButton: false,
      sticky: true
    };
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      const processedValue = { ...formValue };
      this.config.fields.forEach(field => {
        if (field.type === 'dateRange') {
          const fromKey = `${field.name}From`;
          const toKey = `${field.name}To`;
          
          if (formValue[fromKey]) {
            processedValue.fromDate = formValue[fromKey];
          }
          if (formValue[toKey]) {
            processedValue.toDate = formValue[toKey];
          }
          
          delete processedValue[fromKey];
          delete processedValue[toKey];
        }
      });

      this.parametersSubmit.emit(processedValue);
    }
  }

  onReset(): void {
    this.form.reset();
    this.parametersReset.emit();
  }

  onExit(): void {
    this.exitReport.emit();
  }

  getFieldColumnClass(field: ReportFieldConfig): string {
    if (field.type === 'dateRange' || field.name == 'includeInactive') {
      return 'col-md-12 form-group';
    } 
    return 'col-md-6 form-group';
  }
}