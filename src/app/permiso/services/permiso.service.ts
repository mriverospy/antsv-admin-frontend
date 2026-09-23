import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorHandler } from '../../shared/handlers/http.error.handler';
import { finalize, catchError } from 'rxjs/operators';
import { TableData } from '../../shared/models/table-data.model';
import { MessageResponse } from '../../shared/models/message-response.model';
import { Permiso } from '../models/permiso.model';
import { headers } from '../../shared/helpers/util';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {

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

    return this.http.get<MessageResponse>("api/permiso/", { params, headers })
      .pipe(finalize(() => {this.loading.next(false) }))
      .pipe(catchError(this.handler.handleError<MessageResponse>("permiso:list")));
  }

  getPermisos(): Observable<MessageResponse>  {
    this.loading.next(true);
    return this.http.get<MessageResponse>("api/permiso/list", { headers })
    .pipe(finalize(() => { this.loading.next(false); }))
    .pipe(catchError(this.handler.handleError<MessageResponse>("obtenerPermisos",null)));
  }

  create(data: Permiso): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.post<MessageResponse>('api/permiso/create', data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('permiso:create')));
  }

  update(id: number, data: Permiso): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.put<MessageResponse>(`api/permiso/update/${id}`, data, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('permiso:update')));
  }

  delete(id: number): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.delete<MessageResponse>(`api/permiso/delete/${id}`, { headers })
      .pipe(finalize(() => { this.loading.next(false) }))
      .pipe(catchError(this.handler.handlePostError<MessageResponse>('permiso:delete')));
  }

}
