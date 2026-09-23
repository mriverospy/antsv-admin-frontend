import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { headers } from 'src/app/shared/helpers/util';
import { ChangePassword } from '../models/change-password.model';


@Injectable({
  providedIn: 'root'
})
export class MiPerfilPassService {

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);
  private apiUrl = 'api/perfil';

  constructor(private http: HttpClient) { }

  connect(): Observable<boolean> {
    return this.loading.asObservable();
  }

  disconnect(): void {
    this.loading.complete();
  }

cambiarPassword(currentPassword: string, password: string, password2: string): Observable<MessageResponse> {
  const body = {
    currentPassword: currentPassword,
    password: password,
    password2: password2
  };
  return this.http.put<MessageResponse>('/api/usuario/updateMyPassword', body);
}

}
