import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificacionUI } from '../notificacion/models/notificacion.model';
import { AppBreadcrumbService } from '../app.breadcrumb.service';
import { NotificacionService } from '../notificacion/services/notificacion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.scss']
})
export class NotificacionComponent implements OnInit, OnDestroy {
  notificaciones: NotificacionUI[] = [];
  filtroLeido: string = 'todas';
  private destroy$ = new Subject<void>();

  estadosFiltro = [
    { label: 'Todas', value: 'todas' },
    { label: 'No leídas', value: 'false' },
    { label: 'Leídas', value: 'true' }
  ];

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private notificacionService: NotificacionService
  ) {
    this.breadcrumbService.setItems([
      { label: "Inicio", routerLink: ["/home"] },
      { label: "Notificaciones" },
    ]);
  }

  ngOnInit(): void {
    this.notificacionService.notificaciones$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(lista => {
      this.notificaciones = lista.map(n => ({
        ...n,
        leido: n.estado === 'Leida'
      }));
    });
  }
  
  marcarComoLeida(id: number): void {
    this.notificacionService.marcarComoLeida(id).subscribe({
      next: (notifActualizada) => {
        const notif = this.notificaciones.find(n => n.idNotificacion === id);
        if (notif) {
          notif.leido = true;
          notif.estado = 'Leida';
          notif.fechaLectura = notifActualizada.fechaLectura;
        }
      },
      error: (err) => {
        console.error('Error marcando como leída', err);
      }
    });
  }

  marcarComoNoLeida(id: number): void {
    this.notificacionService.marcarComoNoLeida(id).subscribe({
      next: (notifActualizada) => {
        const notif = this.notificaciones.find(n => n.idNotificacion === id);
        if (notif) {
          notif.leido = false;
          notif.estado = 'No Leida';
          notif.fechaLectura = undefined;
        }
      },
      error: (err) => {
        console.error('Error marcando como no leída', err);
      }
    });
  }

  marcarTodasComoLeidas(): void {
    const idUsuario = this.getIdUsuario();
    if (idUsuario) {
      this.notificacionService.marcarTodasComoLeidas(idUsuario).subscribe({
        error: (err) => {
          console.error('Error marcando todas como leídas', err);
        }
      });
    }
  }

  private getIdUsuario(): number | null {
    const sessionRaw = localStorage.getItem('ngx_current_user');
    if (!sessionRaw) return null;
    try {
      const session = JSON.parse(sessionRaw);
      return session.usuario?.idUsuario || null;
    } catch {
      return null;
    }
  }

  get notificacionesFiltradas(): NotificacionUI[] {
    if (this.filtroLeido === 'true') {
      return this.notificaciones.filter(n => n.leido);
    } else if (this.filtroLeido === 'false') {
      return this.notificaciones.filter(n => !n.leido);
    }
    return this.notificaciones;
  }

  trackByFn(index: number, item: NotificacionUI): number {
    return item.idNotificacion;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
