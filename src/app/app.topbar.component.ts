import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { trigger, style, transition, animate, AnimationEvent } from '@angular/animations';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { LoginService } from './login/services/login.service';
import { Router } from '@angular/router';
import { StorageManagerService } from './shared/services/storage-manager.service';
import { UserSession } from './shared/models/usersession.model';
import { MiPerfilInfo } from '../../src/app/mi-perfil/mi-perfil-info/models/mi-perfil-info.models';
import { MiPerfilService } from '../../src/app/mi-perfil/mi-perfil-info/services/mi-perfil-info.service';
import { Notificacion } from './shared/models/notificacion.model';
import { NotificacionUI } from '../app/notificacion/models/notificacion.model';
import { NotificacionService } from '../app/notificacion/services/notificacion.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss'],
    animations: [
        trigger('topbarActionPanelAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scaleY(0.8)' }),
                animate('.12s cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 1, transform: '*' })),
            ]),
            transition(':leave', [
                animate('.1s linear', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class AppTopBarComponent implements OnInit {


    currentSession: UserSession;
    activeItem: number;
    notificaciones: Notificacion[] = [];
    notificacionesPendientes: number = 0;
    intervaloNotificaciones: any;
    newNotificationsCount: number = 0;

    fotoPerfil: string = '';
    perfil!: MiPerfilInfo;

    constructor(
        public appMain: AppMainComponent,
        public app: AppComponent,
        private loginService: LoginService,
        private router: Router,
        private storageManager: StorageManagerService,
        private perfilService: MiPerfilService,
        private notificacionService: NotificacionService,
    ) {
        this.currentSession = this.storageManager.getCurrenSession();
    }




    @ViewChild('searchInput') searchInputViewChild: ElementRef;

    onSearchAnimationEnd(event: AnimationEvent) {
        switch (event.toState) {
            case 'visible':
                this.searchInputViewChild.nativeElement.focus();
                break;
        }
    }


    toggleNotifications(): void {
        this.router.navigate(['/notificaciones']);
    }

    logout(event: any) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Cerrar el menú desplegable si está abierto
        this.activeItem = null;
        if (this.appMain) {
            this.appMain.activeTopbarItem = null;
        }

        // Llamar al método centralizado de logout (maneja todo automáticamente)
        this.loginService.logout();
    }

    goToAjustes() {
        this.router.navigate(['/perfil']);
    }

    ngOnInit() {
        this.cargarPerfil();

        // Suscribirse a cambios de imagen del perfil
        this.perfilService.imagenPerfil$.subscribe(url => {
            if (url) {
                this.fotoPerfil = url;
            }
        });

        this.notificacionService.notificaciones$.subscribe(lista => {
            this.notificaciones = lista.map(n => ({
                ...n,
                leido: n.leido ?? (n.estado === 'Leida'),
                fechaCreacion: n.fechaEmision
            }));
            this.actualizarContadorPendientes();
        });

        if (this.notificacionService.getNotificacionesValue().length === 0) {
            const sessionRaw = localStorage.getItem('ngx_current_user');
            if (!sessionRaw) return;
            const session = JSON.parse(sessionRaw);
            const idUsuario = session.usuario?.idUsuario;
            if (!idUsuario) return;

            this.notificacionService.obtenerPorUsuario(idUsuario).subscribe();
        }

    }

    ngOnDestroy() {
        if (this.intervaloNotificaciones) {
            clearInterval(this.intervaloNotificaciones);
        }
    }

    verTodasLasNotificaciones(): void {
        this.appMain.activeTopbarItem = null;
        this.router.navigate(['/notificaciones']);
    }

    marcarComoLeida(idNotificacion: number): void {
        const notif = this.notificaciones.find(n => n.idNotificacion === idNotificacion);
        if (!notif || notif.leido) return;

        // Actualización optimista local
        notif.leido = true;
        notif.estado = 'Leida';
        this.actualizarContadorPendientes();

        this.notificacionService.marcarComoLeida(idNotificacion).subscribe({
            next: resp => {
                // Ya el BehaviorSubject se actualiza desde el servicio
            },
            error: err => {
                console.error('Error marcando notificación como leída', err);
                // Revertir si hubo error
                notif.leido = false;
                notif.estado = 'Pendiente';
                this.actualizarContadorPendientes();
            }
        });
    }

    private actualizarContadorPendientes(): void {
        this.notificacionesPendientes = this.notificaciones.filter(n => !n.leido).length;
    }

    cargarPerfil() {
        const sessionRaw = localStorage.getItem('ngx_current_user');
        if (!sessionRaw) {
            console.warn('No se encontró sesión del usuario');
            return;
        }

        const session = JSON.parse(sessionRaw);
        const userId = session.usuario?.idUsuario;

        if (!userId) {
            console.warn('No se encontró idUsuario en la sesión');
            return;
        }
        this.perfilService.obtenerMiPerfil(userId).subscribe({
            next: (data: MiPerfilInfo) => {
                this.perfil = data;

                // Generar avatar con iniciales (Nombre + Apellido)
                const iniciales = `${data.nombre || 'U'} ${data.apellido || ''}`.trim();
                this.fotoPerfil = `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciales)}&background=cccccc&color=555555&size=150`;

                // Si hay imagen en base64, sobrescribir el avatar
                if (data.imagenPerfilBase64) {
                    this.fotoPerfil = `data:image/png;base64,${data.imagenPerfilBase64}`;
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
    }


}
