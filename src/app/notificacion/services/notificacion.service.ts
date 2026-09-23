import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map, interval, switchMap, catchError, takeUntil, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { NotificacionUI } from '../models/notificacion.model';
import { headers } from '../../shared/helpers/util';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService implements OnDestroy {

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);

  private apiUrl = 'api/notificaciones';

  private notificacionesSubject = new BehaviorSubject<NotificacionUI[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  private pollingActive = false;
  private idUsuario: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.initializePolling();
  }

  connect(): Observable<boolean> {
    return this.loading.asObservable();
  }

  disconnect(): void {
    this.loading.complete();
    // Detener el polling
    this.stopPolling();
  }

  /**
   * Detiene el polling de notificaciones
   */
  public stopNotificationPolling(): void {
    this.stopPolling();
  }

  public getNotificacionesValue(): NotificacionUI[] {
    return this.notificacionesSubject.value;
  }

  /**
   * Obtiene las notificaciones de un usuario con filtros opcionales
   * @param idUsuario
   * @param filtro 
   * @returns 
   */
  obtenerPorUsuario(filtro: any = {}): Observable<NotificacionUI[]> {
    this.loading.next(true);
    this.loadUserIdFromSession();

    let params = new HttpParams().set('idUsuario', this.idUsuario?.toString() || '');
    Object.keys(filtro).forEach(key => {
      if (filtro[key] !== null && filtro[key] !== undefined) {
        params = params.set(key, filtro[key]);
      }
    });

    // Si no existe usuario, detener el polling
    if (!this.idUsuario) {
      this.stopPolling();
      return new Observable<NotificacionUI[]>(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    return this.http.get<any>(`${this.apiUrl}/usuario`, { params, headers })
      .pipe(
        map(resp => {
          const lista = resp.data?.lista || [];
          // Solo actualizar si la lista es diferente o está vacía
          if (this.notificacionesSubject.value.length === 0) {
            this.notificacionesSubject.next(lista);
          }
          return lista;
        }),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handleError<NotificacionUI[]>('obtenerPorUsuario'))
      );
  }


  // Listar solo no leídas
  listarNoLeidas(idUsuario: number): Observable<NotificacionUI[]> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`${this.apiUrl}/usuario/${idUsuario}/pendientes`, { headers })
      .pipe(
        map(res => res.data.lista as NotificacionUI[]),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handleError<NotificacionUI[]>('listarNoLeidas'))
      );
  }

  marcarComoLeida(id: number): Observable<NotificacionUI> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`${this.apiUrl}/markAsRead/${id}`, {}, { headers })
      .pipe(
        map(res => {
          const notifActualizada = res.data.notificacion as NotificacionUI;
          const actuales = this.notificacionesSubject.value;
          const index = actuales.findIndex(n => n.idNotificacion === id);
          if (index > -1) {
            actuales[index] = { ...actuales[index], ...notifActualizada, leido: true };
            this.notificacionesSubject.next([...actuales]);
          }
          return notifActualizada;
        }),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handlePostError<NotificacionUI>('markAsRead'))
      );
  }

  marcarComoNoLeida(id: number): Observable<NotificacionUI> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`${this.apiUrl}/markAsUnread/${id}`, {}, { headers })
      .pipe(
        map(res => {
          const notifActualizada = res.data.notificacion as NotificacionUI;
          const actuales = this.notificacionesSubject.value;
          const index = actuales.findIndex(n => n.idNotificacion === id);
          if (index > -1) {
            actuales[index] = { ...actuales[index], ...notifActualizada, leido: false };
            this.notificacionesSubject.next([...actuales]);
          }
          return notifActualizada;
        }),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handlePostError<NotificacionUI>('markAsUnread'))
      );
  }

  marcarTodasComoLeidas(idUsuario: number): Observable<NotificacionUI[]> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`${this.apiUrl}/markAllAsRead/${idUsuario}`, {}, { headers })
      .pipe(
        map(res => {
          const actualizadas = (res.data?.lista || []) as NotificacionUI[];
          // Actualizar solo las notificaciones que fueron marcadas como leídas
          // Mantener las que ya estaban leídas
          const actuales = this.notificacionesSubject.value;
          const actualizadasMap = new Map(actualizadas.map(n => [n.idNotificacion, { ...n, leido: true } as NotificacionUI]));

          const notificacionesActualizadas: NotificacionUI[] = actuales.map(n => {
            if (actualizadasMap.has(n.idNotificacion)) {
              return actualizadasMap.get(n.idNotificacion)!;
            }
            // Si ya estaba leída, mantenerla pero asegurar que tenga el estado correcto
            return { ...n, leido: true, estado: 'Leida' } as NotificacionUI;
          });

          this.notificacionesSubject.next(notificacionesActualizadas);
          return actualizadas;
        }),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handlePostError<NotificacionUI[]>('markAllAsRead'))
      );
  }



  getById(id: number): Observable<NotificacionUI> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(res => res.data.notificacion as NotificacionUI),
        finalize(() => this.loading.next(false)),
        catchError(this.handler.handleError<NotificacionUI>('getById'))
      );
  }

  /**
   * Inicializa el polling automático de notificaciones
   * Se ejecuta cada 3 segundos cuando hay un usuario autenticado
   */
  public initializePolling(): void {
    // Cargar el ID del usuario desde localStorage
    this.loadUserIdFromSession();

    if (!this.idUsuario) {
      console.warn('No se encontró ID de usuario para iniciar polling');
      return;
    }

    // Iniciar polling cada 30 segundos
    interval(30000).pipe(
      switchMap(() => {
        if (this.idUsuario) {
          return this.obtenerPorUsuario(this.idUsuario).pipe(
            tap(() => console.log('Notificaciones actualizadas por polling')),
            catchError(err => {
              // Si la sesion es invalida, se detiene el polling
              if (err.status === 401) {
                this.stopPolling();
                return [];
              }
              console.error('Error en polling de notificaciones:', err);
              return [];
            })
          );
        }
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.pollingActive = true;
  }

  private stopPolling(): void {
    if (this.pollingActive) {
      this.destroy$.next();
      this.pollingActive = false;

      // Crear un nuevo Subject para poder reiniciar el polling si es necesario
      this.destroy$ = new Subject<void>();
    }
  }

  /**
   * Carga el ID del usuario desde localStorage
   */
  private loadUserIdFromSession(): void {
    const sessionRaw = localStorage.getItem('ngx_current_user');
    if (!sessionRaw) {
      return;
    }

    try {
      const session = JSON.parse(sessionRaw);
      const userId = session.usuario?.idUsuario;

      if (!userId) {
        return;
      }

      this.idUsuario = userId;
    } catch (err) {
    }
  }

  /**
   * Detiene el polling cuando el servicio se destruye
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
