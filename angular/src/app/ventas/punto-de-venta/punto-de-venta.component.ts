import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToasterService } from '@abp/ng.theme.shared';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormToolbarComponent } from 'src/app/shared/components/form-toolbar/form-toolbar.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { FormToolbarConfig } from 'src/app/shared/components/form-toolbar/models/form-toolbar.interface';
import { TerminalService } from 'src/app/proxy/terminales';
import { LoteriaService, SorteoService } from 'src/app/proxy/loterias';
import { TicketDto, CrearTicketAdminDto, CrearDetalleTicketDto, TicketService } from 'src/app/proxy/ventas';

interface JugadaRow {
  sorteoId: string;
  nombreSorteo: string;
  tipoJugada: number;
  tipoLabel: string;
  jugadaDisplay: string;
  primerNumero: number;
  segundoNumero: number | null;
  tercerNumero: number | null;
  segundoSorteoId: string | null;
  monto: number;
}

@Component({
  selector: 'app-punto-de-venta',
  templateUrl: './punto-de-venta.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule, FormToolbarComponent, InputComponent, SelectComponent]
})
export class PuntoDeVentaComponent implements OnInit {
  terminalForm!: FormGroup;
  jugadaForm!: FormGroup;
  jugadas: JugadaRow[] = [];
  ticketGenerado: TicketDto | null = null;
  isProcessing = false;
  sorteoItems: any[] = [];
  todosSorteos: any[] = []; // ponytail: all sorteos for super pale second pick

  tiposJugada = [
    { id: 1, nombre: 'Quiniela', digitos: 2 },
    { id: 2, nombre: 'Pale', digitos: 4 },
    { id: 3, nombre: 'Tripleta', digitos: 6 },
    { id: 4, nombre: 'Super Pale', digitos: 4 }
  ];

  formToolbarConfig: FormToolbarConfig = {
    title: 'Punto de Venta',
    subtitle: 'Procesar jugadas desde el panel administrativo',
    showSaveButton: false,
    showCancelButton: false,
    sticky: true,
    buttons: []
  };

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService,
    public terminalService: TerminalService,
    public loteriaService: LoteriaService,
    public sorteoService: SorteoService,
    private ticketService: TicketService
  ) {}

  // ponytail: cast to any for app-select's SelectService interface, upgrade if type mismatch causes runtime issues
  get terminalSvc(): any { return this.terminalService; }
  get loteriaSvc(): any { return this.loteriaService; }

  ngOnInit(): void {
    this.terminalForm = this.fb.group({
      terminalId: ['', Validators.required],
      loteriaId: ['', Validators.required],
      sorteoId: ['', Validators.required]
    });

    this.jugadaForm = this.fb.group({
      tipoJugada: [1, Validators.required],
      segundoSorteoId: [''],
      jugada: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]]
    });

    this.terminalForm.get('loteriaId')!.valueChanges.subscribe(loteriaId => {
      this.terminalForm.get('sorteoId')!.setValue('');
      this.sorteoItems = [];
      if (loteriaId) {
        this.sorteoService.getPorLoteria(loteriaId).subscribe(s => {
          this.sorteoItems = s.filter((x: any) => x.activo && x.estaAbierto);
        });
      }
    });

    // Load all active sorteos for super pale second pick
    this.sorteoService.getAbiertos().subscribe(s => {
      this.todosSorteos = s.filter((x: any) => x.activo).map((x: any) => ({ ...x, nombre: `${x.nombreLoteria} - ${x.nombre}` }));
    });
  }

  get tipoSeleccionado() {
    return this.tiposJugada.find(t => t.id === this.jugadaForm.get('tipoJugada')!.value);
  }

  get jugadaPlaceholder(): string {
    switch (this.jugadaForm.get('tipoJugada')!.value) {
      case 1: return 'Ej: 56';
      case 2: return 'Ej: 0940';
      case 3: return 'Ej: 194050';
      case 4: return 'Ej: 0940';
      default: return '';
    }
  }

  get jugadaMaxLength(): number {
    return this.tipoSeleccionado?.digitos || 6;
  }

  agregarJugada(): void {
    if (!this.jugadaForm.valid || !this.terminalForm.get('sorteoId')!.value) {
      this.toasterService.warn('Complete todos los campos y seleccione un sorteo');
      return;
    }

    const tipo = this.jugadaForm.get('tipoJugada')!.value;
    const raw = this.jugadaForm.get('jugada')!.value.toString().padStart(this.tipoSeleccionado!.digitos, '0');
    const monto = this.jugadaForm.get('monto')!.value;
    const sorteoId = this.terminalForm.get('sorteoId')!.value;

    if (tipo === 4 && !this.jugadaForm.get('segundoSorteoId')!.value) {
      this.toasterService.warn('Seleccione el segundo sorteo para Super Pale');
      return;
    }

    const parsed = this.parseJugada(tipo, raw);
    if (!parsed) {
      this.toasterService.error('Jugada inválida. Verifique los dígitos.');
      return;
    }

    const sorteo = this.sorteoItems.find((s: any) => s.id === sorteoId);
    const segundoSorteoId = tipo === 4 ? this.jugadaForm.get('segundoSorteoId')!.value : null;

    this.jugadas.push({
      sorteoId,
      nombreSorteo: sorteo ? `${sorteo.nombreLoteria || ''} - ${sorteo.nombre}` : sorteoId,
      tipoJugada: tipo,
      tipoLabel: this.tipoSeleccionado!.nombre,
      jugadaDisplay: parsed.display,
      primerNumero: parsed.primero,
      segundoNumero: parsed.segundo,
      tercerNumero: parsed.tercero,
      segundoSorteoId,
      monto
    });

    this.jugadaForm.patchValue({ jugada: '', monto: null, segundoSorteoId: '' });
  }

  private parseJugada(tipo: number, raw: string): { display: string, primero: number, segundo: number | null, tercero: number | null } | null {
    const digits = raw.replace(/\D/g, '');

    if (tipo === 1) {
      if (digits.length < 2) return null;
      const n = parseInt(digits.substring(0, 2));
      if (n < 0 || n > 99) return null;
      return { display: digits.substring(0, 2), primero: n, segundo: null, tercero: null };
    }

    if (tipo === 2 || tipo === 4) {
      if (digits.length < 4) return null;
      const n1 = parseInt(digits.substring(0, 2));
      const n2 = parseInt(digits.substring(2, 4));
      if (n1 < 0 || n1 > 99 || n2 < 0 || n2 > 99) return null;
      return { display: `${digits.substring(0, 2)}-${digits.substring(2, 4)}`, primero: n1, segundo: n2, tercero: null };
    }

    if (tipo === 3) {
      if (digits.length < 6) return null;
      const n1 = parseInt(digits.substring(0, 2));
      const n2 = parseInt(digits.substring(2, 4));
      const n3 = parseInt(digits.substring(4, 6));
      if (n1 < 0 || n1 > 99 || n2 < 0 || n2 > 99 || n3 < 0 || n3 > 99) return null;
      return { display: `${digits.substring(0, 2)}-${digits.substring(2, 4)}-${digits.substring(4, 6)}`, primero: n1, segundo: n2, tercero: n3 };
    }

    return null;
  }

  eliminarJugada(index: number): void {
    this.jugadas.splice(index, 1);
  }

  get totalMonto(): number {
    return this.jugadas.reduce((sum, j) => sum + j.monto, 0);
  }

  procesarTicket(): void {
    if (!this.terminalForm.get('terminalId')!.value) {
      this.toasterService.warn('Seleccione una terminal');
      return;
    }
    if (this.jugadas.length === 0) {
      this.toasterService.warn('Agregue al menos una jugada');
      return;
    }

    this.isProcessing = true;
    this.ticketGenerado = null;

    const input: CrearTicketAdminDto = {
      terminalId: this.terminalForm.get('terminalId')!.value,
      detalles: this.jugadas.map(j => ({
        sorteoId: j.sorteoId,
        tipoJugada: j.tipoJugada,
        primerNumero: j.primerNumero,
        segundoNumero: j.segundoNumero,
        tercerNumero: j.tercerNumero,
        segundoSorteoId: j.segundoSorteoId || undefined,
        monto: j.monto
      } as CrearDetalleTicketDto))
    };

    this.ticketService.procesarVentaAdmin(input).subscribe({
      next: (ticket) => {
        this.ticketGenerado = ticket;
        this.toasterService.success(`Ticket ${ticket.codigoTicket} generado`);
        this.isProcessing = false;
        this.jugadas = [];
      },
      error: () => this.isProcessing = false
    });
  }
}
