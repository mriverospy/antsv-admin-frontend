import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorHandler } from '../../shared/handlers/http.error.handler';
import { finalize, catchError } from 'rxjs/operators';
import { MessageResponse } from '../../shared/models/message-response.model';
import { headers } from '../../shared/helpers/util';

@Injectable({
  providedIn: 'root'
})
export class TiposService {

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

    /**
     * Search main classs in TiposController
     * @param tipo tipo de entidad a listar
     * @returns 
     */
    getTipo(tipo: string): Observable<MessageResponse>  {
        this.loading.next(true);
        return this.http.get<MessageResponse>(`api/tipo/${tipo}/list`, { headers })
        .pipe(finalize(() => { this.loading.next(false); }))
        .pipe(catchError(this.handler.handleError<MessageResponse>(`obtenerTipo${tipo.charAt(0).toUpperCase().concat(tipo.substring(1, tipo.length))}`,null)));
    }

    getTipoById(tipo: string, id: number): Observable<MessageResponse>  {
      this.loading.next(true);
      return this.http.get<MessageResponse>(`api/tipo/${tipo}/${id}/list`, { headers })
      .pipe(finalize(() => { this.loading.next(false); }))
      .pipe(catchError(this.handler.handleError<MessageResponse>(`obtenerTipo${tipo.charAt(0).toUpperCase().concat(tipo.substring(1, tipo.length))}`,null)));
  }

  /**
     * Obtener categorías de documentos
     * @returns 
     */
  getCategoriasDocumento(): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`api/tipo/categoria_documento/list`, { headers })
    .pipe(finalize(() => { this.loading.next(false); }))
    .pipe(catchError(this.handler.handleError<MessageResponse>('obtenerCategorias',null)));
  }

  /**
   * Obtener tipos de documentos por categoría
   * @param idCategoria 
   * @returns 
   */
  getTiposDocumentoByCategoria(idCategoria: number): Observable<MessageResponse> {
    this.loading.next(true);
    return this.http.get<MessageResponse>(`api/tipo/documento/categoria/${idCategoria}/list`, { headers })
    .pipe(finalize(() => { this.loading.next(false); }))
    .pipe(catchError(this.handler.handleError<MessageResponse>('obtenerTiposByCategoria',null)));
  }

}
