import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { StorageManagerService } from 'src/app/shared/services/storage-manager.service';
import { NotificacionService } from 'src/app/notificacion/services/notificacion.service';
import { Login } from '../models/login.model';
import { LoginResponse } from '../../shared/models/login-response';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'api/auth';

  private handler: HttpErrorHandler = new HttpErrorHandler();

  constructor(
    private http: HttpClient,
    private storageManager: StorageManagerService,
    private router: Router,
    private notificacionService: NotificacionService
  ) { }

  doLoginIE(code: string, state: string): Observable<any> {
    return this.http.post<any>('api/auth/validateUserIE', { code, state }).pipe(
      catchError((err) => {
        console.error(err);
        err.message = err.error?.message || err.message || 'Error desconocido';
        return throwError(() => err);
      })
    );
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  getConfig() {
    const headers = { "Content-Type": "application/json;charset=utf-8" };
    return this.http.post('api/auth/urlIE', { headers })
  }

  doLogin(data: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('api/auth/login', data).pipe(
      catchError(this.handler.handleError<LoginResponse>('doLogin', new LoginResponse()))
    );
  }

  refreshToken(accessToken: string, refreshToken: string) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post('api/auth/refreshToken', { accessToken, refreshToken }, httpOptions);
  }

  /**
   * Método centralizado para cerrar sesión.
   * Maneja todo el flujo: invalida el token en el backend, limpia el storage local y navega al login.
   * Este método puede ser llamado desde cualquier componente sin necesidad de manejar subscribes.
   */
  logout(): void {
    // Detener el polling de notificaciones
    this.notificacionService.stopNotificationPolling();

    const token = this.storageManager.getAccessToken();

    // Si no hay token, solo limpiar el storage y navegar
    if (!token) {
      this.storageManager.deleteStorage();
      this.navigateToLogin();
      return;
    }

    // Llamar al endpoint del backend para invalidar el token en Redis
    const logoutRequest = { token: token };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    this.http.post('api/auth/logout', logoutRequest, httpOptions).pipe(
      catchError((error) => {
        // Si falla la llamada al backend, aún consideramos el logout como exitoso
        // para que siempre se limpie la sesión local (evita que el usuario quede "atrapado")
        console.warn('Error al cerrar sesión en el servidor (continuando con logout local):', error?.error?.message || error?.message || error);
        // Retornar un Observable que simula éxito para que siempre se ejecute el finalize
        return new Observable(observer => {
          observer.next({
            message: 'Sesión cerrada localmente',
            warning: 'No se pudo invalidar el token en el servidor, pero la sesión local será cerrada'
          });
          observer.complete();
        });
      }),
      finalize(() => {
        // Siempre limpiar el storage y navegar al login, independientemente del resultado
        this.storageManager.deleteStorage();
        this.navigateToLogin();
      })
    ).subscribe({
      next: () => {
        // Logout exitoso
      },
      error: (error) => {
        // Este error no debería ocurrir porque catchError ya lo maneja
        // pero por si acaso, aún así ejecutamos el finalize
        console.error('Error inesperado durante logout:', error);
      }
    });
  }

  /**
   * Método interno para navegar al login con manejo de errores
   */
  private navigateToLogin(): void {
    this.router.navigate(['/login']).catch(err => {
      console.error('Error navegando al login:', err);
      // Si falla la navegación con el router, usar window.location como fallback
      window.location.href = '/login';
    });
  }

  /**
   * Método legacy para mantener compatibilidad si es necesario.
   * Retorna un Observable para casos donde se necesite manejar el flujo manualmente.
   * @deprecated Usar logout() en su lugar, que maneja todo automáticamente
   */
  doLogout(): Observable<any> {
    const token = this.storageManager.getAccessToken();

    // Si no hay token, solo retornar éxito (el componente limpiará el storage)
    if (!token) {
      return new Observable(observer => {
        observer.next({ message: 'Sesión cerrada localmente' });
        observer.complete();
      });
    }

    // Llamar al endpoint del backend para invalidar el token en Redis
    const logoutRequest = { token: token };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.post('api/auth/logout', logoutRequest, httpOptions).pipe(
      catchError((error) => {
        // Si falla la llamada al backend, aún consideramos el logout como exitoso
        // para que siempre se limpie la sesión local (evita que el usuario quede "atrapado")
        console.warn('Error al cerrar sesión en el servidor (continuando con logout local):', error?.error?.message || error?.message || error);
        // Retornar un Observable que simula éxito para que el componente pueda continuar
        // El componente siempre limpiará el storage independientemente del resultado
        return new Observable(observer => {
          observer.next({
            message: 'Sesión cerrada localmente',
            warning: 'No se pudo invalidar el token en el servidor, pero la sesión local será cerrada'
          });
          observer.complete();
        });
      })
    );
  }

  sendResetPasswordEmail(email: string) {
    let params = new HttpParams();
    params = params.set("email", email);
    const httpOptions = {
      params: params,
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post(`${this.apiUrl}/reset-password`, null, httpOptions);
  }
}
