import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { TipoDocumento } from '../models/tipo-documento.model';
import { headers } from '../../shared/helpers/util';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  connect(): Observable<boolean> {
    return this.loading.asObservable();
  }

  disconnect(): void {
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

    Object.keys(advancedFilter).forEach(key => {
      const value = advancedFilter[key];
      if (['estado'].includes(key)) {
          if (value !== null && value !== undefined) {
              params = params.set(key, value);
          }
      } else {
          params = params.set(key, value != null ? value : '');
      }
    });

    return this.http.get<MessageResponse>('api/tipo-documento/', { params, headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('tipo-documento')));
  }

  getByTipoRecurso(tipoRecurso: string): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`api/tipo-documento/by-tipo-recurso/${tipoRecurso}`, { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('tipo-documento:getByTipoRecurso')));
  }

  create(data: TipoDocumento): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.post<MessageResponse>('api/tipo-documento/save', data, { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('create')));
  }

  update(id: number, data: TipoDocumento): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/tipo-documento/update/${id}`, data, { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('update')));
  }

  getById(id: number): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`api/tipo-documento/${id}`, { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('getById')));
  }

  updateStatus(id: number, estado: boolean): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/tipo-documento/updateStatus/${id}?estado=${estado}`, null, { headers })
      .pipe(finalize(() => this.loading.next(false)))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('tipo-documento:updateStatus')));
  }

  getTiposRecurso(): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>('api/tipo-documento/tipos-recurso', { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('tipo-documento:getTiposRecurso')));
  }

  getTiposRecursoNombres(): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>('api/tipo-documento/tipos-recurso-nombres', { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>('tipo-documento:getTiposRecursoNombres')));
  }
}

