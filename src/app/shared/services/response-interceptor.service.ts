import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpEvent, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { StorageManagerService } from './storage-manager.service';
import { LoginService } from '../../login/services/login.service';

const TOKEN_HEADER_KEY = 'Authorization';
const UNAUTHORIZED = 401;

@Injectable()
export class ResponseInterceptorService {

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isRefreshing = false;

  constructor(private storageManager: StorageManagerService, private authService: LoginService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
        catchError(error => {
            const refreshToken = this.storageManager.getRefreshToken();
            const accessToken = this.storageManager.getAccessToken();
            if (error instanceof HttpErrorResponse 
              && !req.url.includes('api/auth/login') 
              && !req.url.includes('api/auth/refreshToken') 
              && error.status === UNAUTHORIZED
              && !req.url.includes('api/auth/validateUserIE')
            ) {
              return this.handleUnauthorizedError(req, next, accessToken, refreshToken);
            }
            return throwError(error);
        })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler, accessToken: string, refreshToken: string) {
    // Si ya estamos refrescando, esperar a que termine
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenHeader(request, token));
        }),
        catchError((err) => {
          this.storageManager.deleteStorage();
          this.router.navigate(['/login']).catch(() => {
            window.location.href = '/login';
          });
          return throwError(err);
        })
      );
    }

    // Marcar que estamos refrescando
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    if (refreshToken) {
      return this.authService.refreshToken(accessToken, refreshToken).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.storageManager.saveAccessToken(response.accessToken);
          this.storageManager.saveRefreshToken(response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addTokenHeader(request, response.accessToken));
        }), 
        catchError((err) => {
          this.isRefreshing = false;
          this.storageManager.deleteStorage();
          this.router.navigate(['/login']).catch(() => {
            window.location.href = '/login';
          });
          return throwError(err);
        })
      );
    }

    // Si no hay refreshToken, redirigir directamente al login
    this.isRefreshing = false;
    this.storageManager.deleteStorage();
    this.router.navigate(['/login']).catch(() => {
      window.location.href = '/login';
    });
    return throwError(new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
  }

}
