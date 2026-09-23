import { Component, OnInit } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { AppBreadcrumbService } from '../app.breadcrumb.service';
import { MiPerfilInfoComponent } from './mi-perfil-info/mi-perfil-info.component';
import { MiPerfilAlertasComponent } from './mi-perfil-alertas/mi-perfil-alertas.component';
import { MiPerfilPassComponent } from './mi-perfil-pass/mi-perfil-pass.component';
import { PermissionGuardService } from "../shared/services/permission-guard.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, TabViewModule, MiPerfilInfoComponent, MiPerfilAlertasComponent, MiPerfilPassComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent implements OnInit {
  

  constructor(private breadcrumbService: AppBreadcrumbService, private permission: PermissionGuardService) {
    
  }

  ngOnInit(): void {


    this.updateBreadcrumb(0); 
     
  }

  checkPermission(nombre: string): boolean {
    return this.permission.hasPermission(nombre);
  }


  onTabChange(event: any): void {
    this.updateBreadcrumb(event.index);
  }

    private updateBreadcrumb(tabIndex: number): void {

    const tabs = [];

    tabs.push({
      label: 'Información General',
      breadcrumb: [
        { label: 'Administración' },
        { label: 'Mi Perfil', routerLink: ['/perfil'] },
        { label: 'Información General' }
      ]
    });

    tabs.push({
      label: 'Seguridad y Accesos',
      breadcrumb: [
        { label: 'Administración' },
        { label: 'Mi Perfil', routerLink: ['/perfil'] },
        { label: 'Seguridad y Accesos' }
      ]
    });


    tabs.push({
      label: 'Alertas y Notificaciones',
      breadcrumb: [
        { label: 'Administración' },
        { label: 'Mi Perfil', routerLink: ['/perfil'] },
        { label: 'Alertas y Notificaciones' }
      ]
    });

    this.breadcrumbService.setItems(
      tabs[tabIndex]?.breadcrumb || tabs[0].breadcrumb
    );
  } 

}
