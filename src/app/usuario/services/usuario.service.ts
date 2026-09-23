import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { TableData } from 'src/app/shared/models/table-data.model';
import { Usuario } from '../models/usuario.model';
import { headers } from '../../shared/helpers/util';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'api/usuario';

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient
  ) { }

  connect(): Observable<boolean> {
    return this.loading.asObservable();
  }

  disconnet(): void {
    this.loading.complete();
  }

  getAll(filter: string, pageSize: number, start: number, sortField: string, sortAsc: boolean, advancedFilter: any): Observable<MessageResponse> {
    this.loading.next(true);

    let params = new HttpParams();
    if (filter) params = params.set('filter', filter);
    if (sortField) params = params.set('sortField', sortField);

    params = params
        .set('page', `${Math.ceil(start / pageSize)}`)
        .set('pageSize', `${pageSize}`)
        .set('sortAsc', `${sortAsc}`);

    Object.keys(advancedFilter).map((key) => {
        const searchValue = advancedFilter[key] != null && advancedFilter[key] != 'null' ? advancedFilter[key] : '';
        params = params.set(key, searchValue);
    });

    return this.http.get<MessageResponse>("api/usuario/", { params, headers })
      .pipe(finalize(() => {this.loading.next(false) }))
      .pipe(catchError(this.handler.handleError<MessageResponse>("usuario")));
  }

  create(data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.post<MessageResponse>('api/usuario/create', data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('create')));
  }

  registroCreate(data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.post<MessageResponse>(`${this.apiUrl}/registro-create`, data, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('create')));
  }

  update(id: number, data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/usuario/update/${id}`, data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('update')));
  }

  delete(id: number): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.delete<MessageResponse>(`api/usuario/delete/${id}`, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('delete')));
  }

  updateStatus(id: number, data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/usuario/updateStatus/${id}`, data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('updateStatus')));
  }

  updatePassword(data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/usuario/updatePassword`, data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('updatePassword')));
  }

  /**
   * Obtener organizaciones disponibles para usuarios
   */
  getOrganizaciones(): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>('api/usuario/getOrganizaciones', { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('getOrganizaciones')));
  }

  procesarAprobacion(id: number, data: Usuario): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/usuario/procesar-aprobacion/${id}`, data, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('updateStatus')));
  }

}
