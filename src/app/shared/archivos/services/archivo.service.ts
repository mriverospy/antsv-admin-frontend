import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { Archivo } from '../models/archivo.model';
import { headers } from '../../../shared/helpers/util';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  connect(): Observable<boolean> {
    return this.loading.asObservable();
  }

  disconnet(): void {
    this.loading.complete();
  }

  getAll(filter: string, pageSize: number, start: number, sortField: string, sortAsc: boolean, advancedFilter: any, idRecurso: number): Observable<MessageResponse> {
    this.loading.next(true);

    let params = new HttpParams();
    if (filter) params = params.set('filter', filter);
    if (sortField) params = params.set('sortField', sortField);
    if (idRecurso) params = params.set('idRecurso', idRecurso);  // <-- agregar

    params = params
        .set('page', `${Math.ceil(start / pageSize)}`)
        .set('pageSize', `${pageSize}`)
        .set('sortAsc', `${sortAsc}`);

    Object.keys(advancedFilter).forEach((key) => {
        const searchValue = advancedFilter[key];
        if (['estado', 'idTipoDocumento'].includes(key)) {
            if (searchValue !== null && searchValue !== undefined && searchValue !== 'null' && searchValue !== '') {
                params = params.set(key, searchValue);
            }
        } else {
            const value = searchValue != null && searchValue != 'null' ? searchValue : '';
            params = params.set(key, value);
        }
    });

    return this.http.get<MessageResponse>("api/archivo/", { params, headers })
        .pipe(finalize(() => this.loading.next(false)))
        .pipe(catchError(this.handler.handleError<MessageResponse>("archivo")));
}

  create(data: Archivo): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.post<MessageResponse>('api/archivo/create', data, { headers })
      .pipe(finalize(() => this.loading.next(false)))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('create')));
  }

  update(id: number, data: Archivo): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/archivo/update/${id}`, data, { headers })
      .pipe(finalize(() => this.loading.next(false)))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('update')));
  }

  delete(id: number, data: Archivo): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/archivo/delete/${id}`, data, { headers })
      .pipe(finalize(() => this.loading.next(false)))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('delete')));
  }

  getById(id: number): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`api/archivo/${id}`, { headers })
      .pipe(finalize(() => this.loading.next(false)))
      .pipe(catchError(this.handler.handleError<MessageResponse>('getById')));
  }

  updateStatus(id: number, data: Archivo): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/archivo/updateStatus/${id}`, data, { headers })
          .pipe(finalize(() => { this.loading.next(false); }))
          .pipe(catchError(this.handler.handlePostError<MessageResponse>('archivos:updateStatus')));
  }

}
