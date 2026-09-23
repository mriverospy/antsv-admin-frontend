import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [RouterModule, ButtonModule, RippleModule,],
  template:  `<div class="flex align-items-center justify-content-center h-screen bg-surface-100">
        <div class="text-center p-4 bg-surface-card border-round shadow-2 w-30rem">
            <div class="mb-4">
                <i class="pi pi-cog text-primary" style="font-size: 4rem; animation: spin 2s linear infinite;"></i>
            </div>
            <h1 class="text-4xl font-bold text-900 mb-4">Página no encontrada</h1>
            <p class="text-600 mb-4">La página solicitada no existe.</p>
            <button pButton pRipple label="Volver al Inicio" [routerLink]="['/perfil']" class="p-button-primary"></button>
        </div>
    </div>
    `,
  styles: [`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})

export class NotfoundComponent {

}
