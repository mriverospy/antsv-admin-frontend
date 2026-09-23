import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { PermissionGuardService } from "../../../shared/services/permission-guard.service";
import { Archivo } from '../models/archivo.model';
import { ArchivoService } from "../services/archivo.service";
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { TipoDocumentoService } from 'src/app/tipo-documento/services/tipo-documento.service';

@Component({
    selector: 'app-archivo-list',
    templateUrl: './archivo-list.component.html',
    styleUrls: ['./archivo-list.component.scss'],
})
export class ArchivoListComponent implements OnInit, OnDestroy, OnChanges {

    @Input() visible: boolean = false;
    @Output() setVisible = new EventEmitter<boolean>();
    @Output() idRecursoUpdated = new EventEmitter<number>();
    @Input() idEntity?: number;
    @Input() idRecurso?: number;
    @Input() fileType: string[] = [];
    @Input() embedded: boolean = false;
    @Input() tipoRecurso?: string;

    // Modal dynamic form
    showDialog: boolean = false;
    selectedArchivo: Archivo;
    isViewMode: boolean = false;

    listaArchivos: Archivo[] = [];
    loading: boolean = false;
    totalRecords: number = 0;

    searchFormGroup: FormGroup;
    pageSize: number = 10;
    start: number = 0;
    filter: string;
    sortField: string = 'fechaCreacion';
    sortAsc: boolean = false;

    estadoOptions = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];

    tipoArchivoOptions = [
        { label: 'IMAGEN', value: 'IMAGEN' },
        { label: 'DOCUMENTO', value: 'DOCUMENTO' },
        { label: 'VIDEO', value: 'VIDEO' }
    ];

    tipoDocumentoOptions: Array<{label: string, value: number}> = [];

    private sortFieldMap = {
        'referenciaArchivo': 'referencia_archivo',
        'fechaCreacion': 'fecha_creacion',
        'estado': 'estado'
    };

    constructor(
        private service: ArchivoService,
        private permission: PermissionGuardService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private formBuilder: FormBuilder,
        private breadcrumbService: AppBreadcrumbService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private tipoDocumentoService: TipoDocumentoService,
    ) {

        this.searchFormGroup = this.formBuilder.group({
            nombreArchivo: [null],
            tipoMime: [null],
            tipoArchivo: [null],
            idTipoDocumento: [null],
            estado: [null]
        });

    }

    ngOnInit(): void {
        this.service.connect().subscribe(loading => {
            this.loading = loading;
            this.cdr.detectChanges();
        });
        this.loadTipoDocumentoOptions();
    }

    loadTipoDocumentoOptions(): void {
        if (this.tipoRecurso) {
            this.tipoDocumentoService.getByTipoRecurso(this.tipoRecurso).subscribe({
                next: (response) => {
                    if (response && response.code === 200 && response.data) {
                        this.tipoDocumentoOptions = (response.data as any[]).map(td => ({
                            label: td.nombre,
                            value: td.idTipoDocumento
                        }));
                    }
                },
                error: (error) => {
                    console.error('Error al cargar tipos de documento:', error);
                    // Si hay error, dejar el array vacío para que no rompa la UI
                    this.tipoDocumentoOptions = [];
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // ngOnChanges solo para inicialización, el evento onShow del diálogo manejará la recarga
        if (changes['tipoRecurso'] && changes['tipoRecurso'].currentValue) {
            this.loadTipoDocumentoOptions();
        }
    }

    onDialogShow(): void {
        // Este método se ejecuta cada vez que el diálogo se muestra
        // Reiniciar paginación y filtros
        this.start = 0;
        this.searchFormGroup.reset();
        
        // Verificar que idRecurso esté disponible antes de cargar
        // Si no está disponible, esperar un ciclo más para que Angular actualice los bindings
        if (!this.idRecurso) {
            // Usar setTimeout para esperar que Angular actualice los bindings
            setTimeout(() => {
                if (this.idRecurso) {
                    this.loadData();
                }
            }, 0);
        } else {
            // Si idRecurso ya está disponible, cargar directamente
            this.loadData();
        }
    }

    ngOnDestroy(): void {
        this.service.disconnet();
    }

    applyFilters(): void {
        this.start = 0;
        this.loadData();
    }

    clearFilters(): void {
        this.searchFormGroup.reset();
        this.start = 0;
        this.loadData();
    }

    onReferenciaArchivoKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.applyFilters();
    }

    loadData(): void {
        // Si no hay idRecurso, no cargar archivos
        if (!this.idRecurso) {
            this.listaArchivos = [];
            this.totalRecords = 0;
            this.loading = false;
            return;
        }
        
        this.loading = true;
        const formValues = this.searchFormGroup.value;
        this.service.getAll(this.filter, this.pageSize, this.start, this.sortField, this.sortAsc, formValues, this.idRecurso)
        .subscribe({
            next: (response) => {
                this.loading = false;
                if (response?.code === 200) {
                    this.listaArchivos = response.data?.lista || [];
                    this.totalRecords = response.data?.totalRecords || 0;
                } else {
                    console.warn('Unexpected response format or code:', response);
                }
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los archivos',
                    life: 3000
                });
            }
        });
    }

    load($event: any): void {
        this.filter = $event?.globalFilter ?? null;
        this.start = $event?.first ?? this.start;
        this.pageSize = $event?.rows ?? this.pageSize;

        if ($event?.sortField) {
            this.sortField = this.sortFieldMap[$event.sortField] ?? $event.sortField;
        }

        this.sortAsc = $event?.sortOrder == 1;
        this.loadData();
    }

    openNew(): void {
        this.selectedArchivo = null;
        this.isViewMode = false;
        this.showDialog = true;
    }

    editArchivo(archivo: Archivo): void {
        this.selectedArchivo = { ...archivo };
        this.isViewMode = false;
        this.showDialog = true;
    }

    viewArchivo(archivo: Archivo): void {
        if (!archivo) return;
        this.selectedArchivo = { ...archivo };
        this.isViewMode = true;
        this.showDialog = true;

        // Preparar el archivo base64 para mostrar
        if (archivo.archivoBase64) {
            this.ngZone.run(() => {
                // Si ya tiene el formato data:..., usarlo directamente
                if (archivo.archivoBase64.startsWith('data:')) {
                    this.selectedArchivo.archivoBase64 = archivo.archivoBase64;
                } else {
                    // Si es solo base64, agregar el prefijo data:
                    const mimeType = archivo.tipoMime || 'application/octet-stream';
                    this.selectedArchivo.archivoBase64 = `data:${mimeType};base64,${archivo.archivoBase64}`;
                }
                this.cdr.detectChanges();
            });
        } else {
            // Si no hay archivoBase64, intentar con referenciaArchivo
            if (archivo.referenciaArchivo) {
                this.ngZone.run(() => {
                    const parts = archivo.referenciaArchivo.split(',');
                    if (parts.length === 2) {
                        const base64Data = parts[1];
                        const mimeType = archivo.tipoMime || 'application/octet-stream';
                        this.selectedArchivo.archivoBase64 = `data:${mimeType};base64,${base64Data}`;
                    }
                    this.cdr.detectChanges();
                });
            }
        }
    }
    toggleEstado(archivo: any) {
        const nuevoEstado = !archivo.estado;

        this.service.update(archivo.id, archivo)
            .subscribe({
                next: () => {
                    archivo.estado = nuevoEstado; // se refleja en la vista
                },
                error: (err) => {
                    console.error("Error al cambiar estado", err);
                }
            });
    }

    previewArchivo(archivo: Archivo): void {
        if (!archivo.archivoBase64) return;

        this.selectedArchivo = { ...archivo };
        this.isViewMode = true;
        this.showDialog = true;

        this.ngZone.run(() => {
            // Si ya tiene el formato data:..., usarlo directamente
            if (archivo.archivoBase64.startsWith('data:')) {
                this.selectedArchivo.archivoBase64 = archivo.archivoBase64;
            } else {
                // Si es solo base64, agregar el prefijo data:
                const mimeType = archivo.tipoMime || 'application/octet-stream';
                this.selectedArchivo.archivoBase64 = `data:${mimeType};base64,${archivo.archivoBase64}`;
            }
            this.cdr.detectChanges();
        });
    }

    deleteArchivo(archivo: Archivo): void {
        if (!archivo.idArchivo) return;

        this.confirmationService.confirm({
            key: 'archivoDialog',
            message: `¿Seguro que deseas eliminar el archivo "${archivo.referenciaArchivo.split(',')[0]}"?`,
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.service.delete(archivo.idArchivo, archivo).subscribe({
                    next: (res) => {
                        this.listaArchivos = this.listaArchivos.filter(p => p.idArchivo !== archivo.idArchivo);
                        this.messageService.add({
                            key: 'archivoMsg',
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: res.message || `Archivo "${archivo.referenciaArchivo.split(',')[0]}" eliminado`
                        });
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({
                            key: 'archivoMsg',
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar el archivo'
                        });
                    }
                });
            }
        });
    }

    onFormResponse(event: any): void {
        if (event.success) {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: event.message,
                life: 3000
            });
            this.start = 0;
            this.showDialog = false;
            if (!this.idRecurso && event.data && event.data.idRecurso) {
                this.idRecurso = event.data.idRecurso;
                this.idRecursoUpdated.emit(this.idRecurso);
            }
            this.loadData();
        } else {
            let msg = event.message || '';
            if (
                msg.includes('value too long for type character varying(100)') ||
                msg.includes('DataIntegrityViolationException') ||
                msg.includes('could not execute statement')
            ) {
                msg = 'El nombre del archivo es muy largo. Por favor, utilice un nombre de hasta 100 caracteres.';
            }
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
            });
        }
    }

    checkPermission(nombre: string): boolean {
        return this.permission.hasPermission(nombre);
    }

    closeModal() {
        this.visible = false;
        this.setVisible.emit(false);
    }

    downloadArchivo(archivo: Archivo): void {
        if (!archivo.archivoBase64) {
            console.warn('El archivo no tiene contenido en base64');
            return;
        }

        let base64Data = archivo.archivoBase64;
        // Extraer solo el base64 si tiene el formato data:...
        if (base64Data.startsWith('data:')) {
            const parts = base64Data.split(',');
            base64Data = parts.length > 1 ? parts[1] : base64Data;
        }
        
        let mimeType = archivo.tipoMime && archivo.tipoMime !== 'application/octet-stream'
            ? archivo.tipoMime
            : 'application/octet-stream'; // fallback más genérico

        try {
            // Convertir base64 a blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // Crear link temporal
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = archivo.nombreArchivo || 'archivo_descargado';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error('Error al decodificar base64:', e);
        }
    }

     updateStatus(archivo: Archivo) {
        const nuevoEstado = !archivo.estado;
        const accion = nuevoEstado ? "activar" : "inactivar";

        this.confirmationService.confirm({
            key: 'archivoDialog',
            message: `¿Está seguro que desea ${accion} el archivo "${archivo.nombreArchivo}"?`,
            header: "¡Atención!",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí",
            rejectLabel: "No",
            accept: () => {
                // Creamos un objeto temporal con el estado invertido
                const updatedRow = { ...archivo, estado: nuevoEstado };
        
                this.service.updateStatus(archivo.idArchivo, updatedRow).subscribe({
                    next: (response) => {
                        if (response?.code === 200) {
                            // Actualizamos la UI localmente para no recargar todo
                            archivo.estado = nuevoEstado;
                            this.messageService.add({
                                severity: "success",
                                summary: "Operación exitosa",
                                detail: `Archivo ${nuevoEstado ? "activado" : "inactivado"} exitosamente`,
                                life: 3000
                            });
                            this.loadData(); // Recargar datos para asegurar consistencia
                        } else {
                            this.messageService.add({
                                severity: "error",
                                summary: "Error",
                                detail: response.message || "Error en la operación",
                                life: 3000
                            });
                        }
                    },
                    error: (error) => {
                        console.error("Error:", error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: "Error al cambiar el estado del archivo",
                            life: 3000
                        });
                    }
                });
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    // Métodos para los botones del toolbar
    agregar() {
        this.selectedArchivo = null;
        this.isViewMode = false;
        this.showDialog = true;
    }

    limpiarFiltros() {
        this.searchFormGroup.reset();
        this.loadData();
    }

    ver(archivo: Archivo) {
        this.selectedArchivo = archivo;
        this.isViewMode = true;
        this.showDialog = true;
    }

    editar(archivo: Archivo) {
        this.selectedArchivo = archivo;
        this.isViewMode = false;
        this.showDialog = true;
    }

    eliminar(archivo: Archivo) {
        this.confirmationService.confirm({
            key: 'archivoDialog',
            message: '¿Está seguro que desea eliminar este archivo?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.service.delete(archivo.idArchivo, archivo).subscribe(response => {
                    if (response?.code == 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Operación exitosa',
                            detail: 'El archivo ha sido eliminado exitosamente',
                            life: 3000
                        });
                        this.loadData();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar el archivo',
                            life: 3000
                        });
                    }
                }, error => {
                    console.error('Error al eliminar el archivo:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Ocurrió un error al intentar eliminar el archivo',
                        life: 3000
                    });
                });
            }
        });
    }

    descargar(archivo: Archivo) {
        
        if (archivo.archivoBase64) {
            // Extraer solo el base64 si tiene el formato data:...
            let base64Data = archivo.archivoBase64;
            if (base64Data.startsWith('data:')) {
                const parts = base64Data.split(',');
                base64Data = parts.length > 1 ? parts[1] : base64Data;
            }
            this.downloadBase64File(base64Data, archivo.nombreArchivo || 'archivo');
        } else if (archivo.idArchivo) {
            // Descargar desde el backend usando idArchivo
            this.descargarDesdeBackend(archivo.idArchivo.toString(), archivo.nombreArchivo || 'archivo');
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se puede descargar el archivo: contenido no disponible',
                life: 3000
            });
        }
    }

    // Método para descargar archivos desde el backend
    descargarDesdeBackend(fileId: string, fileName: string) {
        if (!fileId || fileId.trim() === '') {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID de archivo no válido',
                life: 3000
            });
            return;
        }
        
        // Crear URL para descarga
        const downloadUrl = `/api/organizacion/download/${fileId}`;
        
        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Método para descargar archivos base64
    downloadBase64File(base64Data: string, fileName: string) {
        try {
            // Decodificar base64
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);

            // Crear link temporal
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error('Error al decodificar base64:', e);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo descargar el archivo',
                life: 3000
            });
        }
    }

    // Métodos para filtros
    onNombreKeydown(event: any) {
        if (event.key === 'Enter') {
            this.loadData();
        }
    }

    onTipoKeydown(event: any) {
        if (event.key === 'Enter') {
            this.loadData();
        }
    }

    onTipoArchivoChange() {
        this.loadData();
    }

    onTipoDocumentoChange() {
        this.loadData();
    }

    onEstadoChange() {
        this.loadData();
    }

}
