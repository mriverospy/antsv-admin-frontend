import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorHandler } from '../../shared/handlers/http.error.handler';
import { finalize, catchError } from 'rxjs/operators';
import { MessageResponse } from '../../shared/models/message-response.model';
import { Rol } from '../models/rol.model';
import { headers } from '../../shared/helpers/util';
import { RolPermiso } from '../models/rol-permiso.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {

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

      return this.http.get<MessageResponse>("api/rol/", { params, headers })
        .pipe(finalize(() => {this.loading.next(false) }))
        .pipe(catchError(this.handler.handleError<MessageResponse>("rol:list")));
    }

    getRoles(): Observable<MessageResponse>  {
        this.loading.next(true);
        return this.http.get<MessageResponse>("api/rol/list", { headers })
        .pipe(finalize(() => { this.loading.next(false); }))
        .pipe(catchError(this.handler.handleError<MessageResponse>("obtenerRoles",null)));
    }

    create(data: Rol): Observable<MessageResponse> {
      this.loading.next(true);
      return this.http.post<MessageResponse>('api/rol/create', data, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('rol:create')));
    }

    update(id: number, data: Rol): Observable<MessageResponse> {
      this.loading.next(true);
      return this.http.put<MessageResponse>(`api/rol/update/${id}`, data, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('rol:update')));
    }

    asociarPermisos(data: RolPermiso): Observable<MessageResponse> {
        this.loading.next(true);
        delete data.rol.permisos;
        return this.http.post<MessageResponse>('api/rol/asociarPermisos', data, { headers })
          .pipe(finalize(() => { this.loading.next(false) }))
          .pipe(catchError(this.handler.handlePostError<MessageResponse>('rol:asociarPermisos')));
    }

    delete(id: number): Observable<MessageResponse> {
      this.loading.next(true);
      return this.http.delete<MessageResponse>(`api/rol/delete/${id}`, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('rol:delete')));
    }

    updateStatus(id: number, data: Rol): Observable<MessageResponse> {
      this.loading.next(true);
      return this.http.put<MessageResponse>(`api/rol/updateStatus/${id}`, data, { headers })
        .pipe(finalize(() => { this.loading.next(false) }))
        .pipe(catchError(this.handler.handlePostError<MessageResponse>('rol:updateStatus')));
    }

}
