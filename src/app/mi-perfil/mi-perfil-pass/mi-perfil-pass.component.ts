import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MiPerfilPassService } from '../mi-perfil-pass/services/mi-perfil-pass.service';
import { ChangePassword } from '../mi-perfil-pass/models/change-password.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-mi-perfil-pass',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './mi-perfil-pass.component.html',
  styleUrls: ['./mi-perfil-pass.component.scss']
})
export class MiPerfilPassComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  displayConfirmation = false;

  constructor(private miPerfilPassService: MiPerfilPassService,
    private messageService: MessageService
  ) {}
  
  onSubmit() {
      if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail:  'Todos los campos son obligatorios',
            life: 3000
          });
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
            detail:  'Las contraseñas no coinciden',
            life: 3000
          });
        return;
      }

      const body: ChangePassword = {
        currentPassword: this.currentPassword,
        password: this.newPassword,
        password2: this.confirmPassword
      };


      this.miPerfilPassService.cambiarPassword(
      this.currentPassword,  
      this.newPassword,
      this.confirmPassword
    )
    .subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Operación exitosa',
          detail: res.message || 'Contraseña cambiada con éxito',
          life: 3000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atención',
          detail: err.error?.message || 'Contraseña cambiada con éxito',
          life: 3000
        });
      }
    });
  }

  openConfirmation() {
    this.displayConfirmation = true;
  }

  closeConfirmation() {
    this.displayConfirmation = false;
  }

  confirmDelete() {
    this.displayConfirmation = false;
  }
}
