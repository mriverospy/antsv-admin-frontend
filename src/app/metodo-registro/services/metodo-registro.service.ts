import { Injectable } from '@angular/core';
import {HttpErrorHandler} from "../../shared/handlers/http.error.handler";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MessageResponse} from "../../shared/models/message-response.model";
import {headers} from "../../shared/helpers/util";
import {catchError, finalize} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MetodoRegistroService {

  private handler: HttpErrorHandler = new HttpErrorHandler();
  private loading = new BehaviorSubject<boolean>(false);

  private apiUrl = 'api/metodo-registro';

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

    Object.keys(advancedFilter).forEach((key) => {
      const searchValue = advancedFilter[key] != null && advancedFilter[key] != 'null' ? advancedFilter[key] : '';
      params = params.set(key, searchValue);
    });

    return this.http.get<MessageResponse>(`${this.apiUrl}/`, { params, headers })
        .pipe(finalize(() => {this.loading.next(false) }))
        .pipe(catchError(this.handler.handleError<MessageResponse>("metodo-registro:list")));
  }

}
