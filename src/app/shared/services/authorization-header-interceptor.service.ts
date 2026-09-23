import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { StorageManagerService } from './storage-manager.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationHeaderInterceptorService implements HttpInterceptor {

  constructor(
    private storageManager: StorageManagerService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.storageManager.getAccessToken();
    if (accessToken) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(clonedRequest);
    } else {
      return next.handle(req);
    }
  }

}
