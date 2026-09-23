import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorHandler } from 'src/app/shared/handlers/http.error.handler';
import { headers } from 'src/app/shared/helpers/util';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { RegistroDocumento } from '../models/registro-documento.model';
import { TiposService } from 'src/app/shared/services/tipos.service';

@Injectable({
    providedIn: 'root'
})
export class RegistroDocumentoService {

    private handler: HttpErrorHandler = new HttpErrorHandler();
    private loading = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient,
        private tiposService: TiposService
    ) { }

    connect(): Observable<boolean> {
        return this.loading.asObservable();
    }

    disconnect(): void {
        this.loading.complete();
    }

    /**
     * Obtener listado de documentos registrados
     * @param filter 
     * @param pageSize 
     * @param start 
     * @param sortField 
     * @param sortAsc 
     * @param advancedFilter 
     * @returns 
     */
    getAll(filter: string, pageSize: number, start: number, sortField: string, sortAsc: boolean, advancedFilter: any): Observable<MessageResponse> {
        this.loading.next(true);

        let params = new HttpParams();
        if (filter) params = params.set('filter', filter);

        // Agregar campo de ordenamiento (ya simplificado por el componente)
        if (sortField) {
            params = params.set('sort', sortField);
        }

        params = params
            .set('page', `${Math.ceil(start / pageSize)}`)
            .set('pageSize', `${pageSize}`)
            .set('asc', `${sortAsc}`);

        Object.keys(advancedFilter).map((key) => {
            const searchValue = advancedFilter[key] != null && advancedFilter[key] != 'null' ? advancedFilter[key] : '';
            params = params.set(key, searchValue);
        });

        return this.http.get<MessageResponse>("api/registro-documento/", { params, headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handleError<MessageResponse>("registro-documento")));
    }

    /**
     * Obtener documentos por persona
     * @param idPersona 
     * @returns 
     */
    getByPersona(idPersona: number): Observable<MessageResponse> {
        this.loading.next(true);
        return this.http.get<MessageResponse>(`api/registro-documento/persona/${idPersona}`, { headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handleError<MessageResponse>("getByPersona")));
    }

    /**
     * Crear un nuevo registro de documento
     * @param data 
     * @returns 
     */
    create(data: RegistroDocumento): Observable<MessageResponse> {
        this.loading.next(true);
        return this.http.post<MessageResponse>('api/registro-documento/create', data, { headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handlePostError<MessageResponse>('create')));
    }

    /**
     * Actualizar un registro existente
     * @param id 
     * @param data 
     * @returns 
     */
    update(id: number, data: RegistroDocumento): Observable<MessageResponse> {
        this.loading.next(true);
        return this.http.put<MessageResponse>(`api/registro-documento/update/${id}`, data, { headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handlePostError<MessageResponse>('update')));
    }

    /**
     * Eliminar un registro de documento
     * @param id 
     * @returns 
     */
    cambiarEstado(id: number, estado: boolean): Observable<MessageResponse> {
        this.loading.next(true);

        // Construir la URL con el ID y el nuevo estado
        const url = `api/registro-documento/estado/${id}?estado=${estado}`;

        return this.http.put<MessageResponse>(url, {}, { headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handlePostError<MessageResponse>('cambiarEstado')));
    }

    /**
     * Obtener categorías de documentos
     * @returns 
     */
    getCategorias(): Observable<MessageResponse> {
        return this.tiposService.getTipo('categoria_documento');
    }

    /**
     * Obtener tipos de documentos por categoría
     * @param idCategoria 
     * @returns 
     */
    getTiposByCategoria(idCategoria: number): Observable<MessageResponse> {
        this.loading.next(true);
        return this.http.get<MessageResponse>(`api/registro-documento/tipos/${idCategoria}`, { headers })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handleError<MessageResponse>('getTiposByCategoria', null)));
    }

    /**
     * Descargar un archivo
     * @param archivoId 
     * @returns 
     */
    downloadFile(archivoId: string): Observable<any> {
        this.loading.next(true);
        return this.http.get(`api/registro-documento/download/${archivoId}`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream'
            }
        })
            .pipe(finalize(() => { this.loading.next(false) }))
            .pipe(catchError(this.handler.handleError<any>('downloadFile', null)));
    }

    /**
     * Obtener validaciones para archivos
     * @returns Observable con las validaciones de archivos
     */
    getFileValidations(): Observable<MessageResponse> {
        return this.http.get<MessageResponse>('api/auth/file-validations', { headers })
            .pipe(catchError(this.handler.handleError<MessageResponse>('getFileValidations', null)));
    }
}