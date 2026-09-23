import { Component } from '@angular/core';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mi-perfil-alertas',
  standalone: true,
  imports: [
    InputSwitchModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    RouterModule
],
  templateUrl: './mi-perfil-alertas.component.html',
  styleUrl: './mi-perfil-alertas.component.scss'
})
export class MiPerfilAlertasComponent {
  toggleValue: boolean = false;
  selectedNotificationPreference: string = 'all';
  emailValue: string = '';
}
