import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '@abp/ng.theme.shared';
import { IdentityUserService, IdentityUserDto } from '@abp/ng.identity/proxy';
import { SharedModule } from '../../../shared/shared.module';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-reset-password',
  templateUrl: './user-reset-password.component.html',
  styleUrls: ['./user-reset-password.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    InputComponent,
    ButtonModule
  ]
})
export class UserResetPasswordComponent implements OnInit {
  form: FormGroup;
  user: IdentityUserDto;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: IdentityUserService,
    private toasterService: ToasterService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.user = this.config.data?.user;
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    if (!this.user) {
      this.toasterService.error('No se proporcionó información del usuario');
      this.ref.close(false);
    }
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Resetea la contraseña del usuario
   */
  resetPassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const newPassword = this.form.value.password;

    // Usar el endpoint de actualización con el campo password
    const updateDto = {
      userName: this.user.userName!,
      name: this.user.name,
      surname: this.user.surname,
      email: this.user.email!,
      phoneNumber: this.user.phoneNumber,
      isActive: this.user.isActive,
      lockoutEnabled: this.user.lockoutEnabled,
      roleNames: [],
      password: newPassword,
      concurrencyStamp: this.user.concurrencyStamp
    };

    this.userService.update(this.user.id!, updateDto as any).subscribe({
      next: () => {
        this.toasterService.success('Contraseña actualizada exitosamente');
        this.isLoading = false;
        this.ref.close(true);
      },
      error: (error) => {
        this.toasterService.error(`Error al actualizar la contraseña: ${error.error?.error?.message || error.message}`);
        this.isLoading = false;
      }
    });
  }

  /**
   * Cierra el diálogo sin guardar
   */
  cancel(): void {
    this.ref.close(false);
  }

  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
}
