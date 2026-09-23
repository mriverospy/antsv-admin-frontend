import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TipoDocumento } from '../models/tipo-documento.model';
import { TipoDocumentoService } from '../services/tipo-documento.service';
import { PermissionGuardService } from 'src/app/shared/services/permission-guard.service';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';

@Component({
  selector: 'app-tipo-documento-list',
  templateUrl: './tipo-documento-list.component.html',
  styleUrls: ['./tipo-documento-list.component.scss']
})
export class TipoDocumentoListComponent implements OnInit, OnDestroy {

    listaTipoDocumentos: TipoDocumento[] = [];
    allTipoDocumentos: TipoDocumento[] = []; // Todos los registros cargados
    gruposTipoRecurso: Map<string, TipoDocumento[]> = new Map(); // Mapa de grupos
    gruposList: Array<{tipoRecurso: string, items: TipoDocumento[]}> = []; // Lista de grupos para paginación
    gruposPaginated: Array<{tipoRecurso: string, items: TipoDocumento[]}> = []; // Grupos paginados
    
    selectedTipoDocumento: TipoDocumento;
    showDialog: boolean = false;
    isViewMode: boolean = false;
    loading: boolean = false;
    totalRecords: number = 0;

    searchFormGroup: FormGroup;
    pageSize: number = 10; // Tamaño de página para grupos
    start: number = 0;
    filter: string;
    sortField: string = 'nombreTipoRecurso';
    sortAsc: boolean = true;
    
    // Control de acordeón - todos colapsados por defecto
    expandedGroups: Set<string> = new Set();
    expandedGroupsItems: Map<string, TipoDocumento[]> = new Map(); // Items completos de grupos expandidos

    tipoRecursoOptions: Array<{label: string, value: string}> = []; // Para filtro (usa nombre)
    tipoRecursoOptionsWithAll: Array<{label: string, value: string | null}> = [];

    estadoOptions = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];

    estadoOptionsWithAll = [
        { label: 'Todos', value: null },
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];

    private sortFieldMap = {
        'nombre': 'nombre',
        'nombreTipoRecurso': 'nombreTipoRecurso',
        'tipoRecurso': 'nombreTipoRecurso', // Compatibilidad con nombre antiguo
        'estado': 'estado',
        'fechaCreacion': 'fechaCreacion'
    };

    constructor(
        private tipoDocumentoService: TipoDocumentoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private permission: PermissionGuardService,
        private formBuilder: FormBuilder,
        private breadcrumbService: AppBreadcrumbService,
        private cdr: ChangeDetectorRef
    ) {
        this.breadcrumbService.setItems([
            { label: "Configuración" },
            { label: "Tipos de Documento", routerLink: ["/tipo-documento"] },
        ]);
    }

    ngOnInit(): void {
        this.initializeForm();
        this.loadTiposRecurso();
        this.load();
    }

    loadTiposRecurso(): void {
        // Cargar tipos de recurso desde la BD para el filtro (usa nombres)
        this.tipoDocumentoService.getTiposRecursoNombres().subscribe({
            next: (response) => {
                if (response.code === 200 && response.data) {
                    this.tipoRecursoOptions = response.data as Array<{label: string, value: string}>;
                    this.tipoRecursoOptionsWithAll = [
                        { label: 'Todos', value: null },
                        ...this.tipoRecursoOptions
                    ];
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se pudieron cargar los tipos de recurso'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los tipos de recurso'
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.tipoDocumentoService.disconnect();
    }

    initializeForm(): void {
        this.searchFormGroup = this.formBuilder.group({
            nombre: [''],
            tipoRecurso: [null],
            estado: [null]
        });
    }

    load(event?: any): void {
        this.loading = true;
        
        if (event) {
            this.start = event.first;
            this.pageSize = event.rows;
            this.sortField = this.sortFieldMap[event.sortField] || 'tipoRecurso';
            this.sortAsc = event.sortOrder === 1;
        }

        const formValue = this.searchFormGroup.value;
        const advancedFilter = {
            nombre: formValue.nombre || '',
            tipoRecurso: formValue.tipoRecurso || '',
            estado: formValue.estado
        };

        // Si no hay filtro de tipoRecurso, ordenar por nombreTipoRecurso para agrupación
        if (!formValue.tipoRecurso && !this.sortField) {
            this.sortField = 'nombreTipoRecurso';
            this.sortAsc = true;
        }

        // Si hay filtro de tipoRecurso específico, usar paginación normal
        // Si no, cargar todos los registros para agrupar correctamente
        const pageSizeToUse = formValue.tipoRecurso ? this.pageSize : 1000;
        const startToUse = formValue.tipoRecurso ? this.start : 0;

        this.tipoDocumentoService.getAll(
            this.filter || '', 
            pageSizeToUse, 
            startToUse, 
            this.sortField, 
            this.sortAsc, 
            advancedFilter
        ).subscribe({
            next: (response) => {
                if (response.code === 200) {
                    this.allTipoDocumentos = response.data.lista || [];
                    this.totalRecords = response.data.totalRecords || 0;
                    
                    // Ordenar por nombreTipoRecurso para agrupación visual
                    if (!formValue.tipoRecurso) {
                        this.allTipoDocumentos.sort((a, b) => {
                            const nombreA = a.nombreTipoRecurso || 'Sin asignar';
                            const nombreB = b.nombreTipoRecurso || 'Sin asignar';
                            if (nombreA < nombreB) return -1;
                            if (nombreA > nombreB) return 1;
                            return 0;
                        });
                    }
                    
                    // Agrupar por tipoRecurso
                    this.groupByTipoRecurso();
                    
                    // Si hay filtro de tipoRecurso, usar lista normal
                    if (formValue.tipoRecurso) {
                        this.listaTipoDocumentos = this.allTipoDocumentos;
                    } else {
                        // Paginar grupos
                        this.paginateGroups();
                    }
                }
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los tipos de documento'
                });
                this.loading = false;
            }
        });
    }

    groupByTipoRecurso(): void {
        this.gruposTipoRecurso.clear();
        this.gruposList = [];
        
        // Agrupar todos los registros por nombreTipoRecurso
        this.allTipoDocumentos.forEach(td => {
            const tipoRecurso = td.nombreTipoRecurso || 'Sin asignar';
            if (!this.gruposTipoRecurso.has(tipoRecurso)) {
                this.gruposTipoRecurso.set(tipoRecurso, []);
            }
            this.gruposTipoRecurso.get(tipoRecurso)!.push(td);
        });
        
        // Crear lista de grupos ordenada
        this.gruposList = Array.from(this.gruposTipoRecurso.entries())
            .map(([tipoRecurso, items]) => ({
                tipoRecurso,
                items: items.sort((a, b) => {
                    if (a.nombre < b.nombre) return -1;
                    if (a.nombre > b.nombre) return 1;
                    return 0;
                })
            }))
            .sort((a, b) => {
                if (a.tipoRecurso < b.tipoRecurso) return -1;
                if (a.tipoRecurso > b.tipoRecurso) return 1;
                return 0;
            });
        
        // Actualizar totalRecords con el número de grupos
        this.totalRecords = this.gruposList.length;
    }

    paginateGroups(): void {
        const end = this.start + this.pageSize;
        this.gruposPaginated = this.gruposList.slice(this.start, end);
        
        // Construir lista plana para la tabla
        // PrimeNG con rowGroupMode necesita al menos un item por grupo para crear el header
        this.listaTipoDocumentos = [];
        this.gruposPaginated.forEach(grupo => {
            // Si el grupo está expandido, usar los items expandidos (que fueron cargados desde el backend)
            if (this.expandedGroups.has(grupo.tipoRecurso)) {
                if (this.expandedGroupsItems.has(grupo.tipoRecurso)) {
                    // Usar TODOS los items expandidos (cargados desde el backend)
                    // Crear una copia nueva para evitar problemas de referencia
                    const expandedItems = [...this.expandedGroupsItems.get(grupo.tipoRecurso)!];
                    // Agregar items uno por uno para asegurar que todos se agreguen
                    expandedItems.forEach(item => {
                        this.listaTipoDocumentos.push(item);
                    });
                } else {
                    // Si por alguna razón no están en expandedGroupsItems, usar los del mapa
                    const allGroupItems = this.gruposTipoRecurso.get(grupo.tipoRecurso) || grupo.items;
                    allGroupItems.forEach(item => {
                        this.listaTipoDocumentos.push(item);
                    });
                }
            } else {
                // Si no está expandido, agregar todos los items del grupo
                // shouldShowRow() ocultará estos items, pero PrimeNG necesita al menos uno para crear el header
                const allGroupItems = this.gruposTipoRecurso.get(grupo.tipoRecurso) || grupo.items;
                this.listaTipoDocumentos.push(...allGroupItems);
            }
        });
    }

    applyFilters(): void {
        this.start = 0;
        this.load();
    }

    clearFilters(): void {
        this.searchFormGroup.reset();
        this.start = 0;
        this.load();
    }

    onNombreKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.applyFilters();
        }
    }

    openNew(): void {
        this.selectedTipoDocumento = new TipoDocumento();
        this.isViewMode = false;
        this.showDialog = true;
    }

    editTipoDocumento(tipoDocumento: TipoDocumento): void {
        this.selectedTipoDocumento = { ...tipoDocumento };
        this.isViewMode = false;
        this.showDialog = true;
    }

    viewTipoDocumento(tipoDocumento: TipoDocumento): void {
        this.selectedTipoDocumento = { ...tipoDocumento };
        this.isViewMode = true;
        this.showDialog = true;
    }

    updateStatus(tipoDocumento: TipoDocumento): void {
        const action = tipoDocumento.estado ? 'inactivar' : 'activar';
        const newStatus = !tipoDocumento.estado;

        this.confirmationService.confirm({
            message: `¿Está seguro de que desea ${action} este tipo de documento?`,
            header: 'Confirmar Acción',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tipoDocumentoService.updateStatus(tipoDocumento.idTipoDocumento!, newStatus).subscribe({
                    next: (response) => {
                        if (response.code === 200) {
                            const actionText = newStatus ? 'activado' : 'inactivado';
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: `Tipo de documento ${actionText} exitosamente`
                            });
                            this.load();
                        }
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Error al ${action} el tipo de documento`
                        });
                    }
                });
            }
        });
    }

    onFormResponse(response: any): void {
        this.showDialog = false;
        if (response.success) {
            // Resetear estado de grupos expandidos para recargar desde cero
            this.expandedGroups.clear();
            this.expandedGroupsItems.clear();
            // Resetear paginación a la primera página
            this.start = 0;
            // Recargar datos
            this.load();
            // Mostrar mensaje de éxito
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.message || 'Operación realizada exitosamente',
                life: 3000
            });
        } else {
            // Mostrar mensaje de error si hay
            if (response.message) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.message,
                    life: 3000
                });
            }
        }
    }

    checkPermission(permission: string): boolean {
        return this.permission.hasPermission(permission);
    }

    toggleGroup(tipoRecurso: string): void {
        if (this.expandedGroups.has(tipoRecurso)) {
            // Colapsar grupo
            this.expandedGroups.delete(tipoRecurso);
            // No eliminar expandedGroupsItems para mantener la referencia
            // Reconstruir la lista para reflejar los cambios
            this.rebuildListaTipoDocumentos();
            this.cdr.detectChanges();
        } else {
            // Expandir grupo - SIEMPRE cargar todos los items desde el backend
            // para asegurar que se muestren todos, incluso si no estaban en la carga inicial
            this.expandedGroups.add(tipoRecurso);
            this.loadGroupItems(tipoRecurso);
        }
    }

    rebuildListaTipoDocumentos(): void {
        const formValue = this.searchFormGroup.value;
        if (formValue.tipoRecurso) {
            // Si hay filtro de tipoRecurso, usar lista normal
            this.listaTipoDocumentos = this.allTipoDocumentos;
        } else {
            // Paginar grupos y reconstruir lista
            this.paginateGroups();
        }
    }

    loadGroupItems(tipoRecurso: string): void {
        const formValue = this.searchFormGroup.value;
        const advancedFilter = {
            nombre: formValue.nombre || '',
            tipoRecurso: tipoRecurso,
            estado: formValue.estado
        };

        // Cargar TODOS los items de este grupo específico desde el backend
        // Usar un pageSize grande para asegurar que se carguen todos
        this.tipoDocumentoService.getAll(
            '', 
            10000, 
            0, 
            'nombre', 
            true, 
            advancedFilter
        ).subscribe({
            next: (response) => {
                if (response.code === 200) {
                    const items = response.data.lista || [];
                    
                    // Guardar todos los items del grupo expandido
                    this.expandedGroupsItems.set(tipoRecurso, items);
                    
                    // Actualizar el grupo en el mapa con todos los items
                    this.gruposTipoRecurso.set(tipoRecurso, items);
                    
                    // Actualizar el conteo en gruposList
                    const grupoIndex = this.gruposList.findIndex(g => g.tipoRecurso === tipoRecurso);
                    if (grupoIndex !== -1) {
                        // Actualizar los items del grupo en gruposList
                        this.gruposList[grupoIndex].items = [...items];
                    }
                    
                    // También actualizar gruposTipoRecurso para asegurar consistencia
                    this.gruposTipoRecurso.set(tipoRecurso, [...items]);
                    
                    // Reconstruir la lista para incluir todos los items del grupo expandido
                    this.rebuildListaTipoDocumentos();
                    this.cdr.detectChanges();
                }
            },
            error: (error) => {
                console.error('Error al cargar items del grupo:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los items del grupo'
                });
            }
        });
    }

    isGroupExpanded(tipoRecurso: string): boolean {
        return this.expandedGroups.has(tipoRecurso);
    }

    shouldShowRow(tipoDocumento: TipoDocumento): boolean {
        return this.isGroupExpanded(tipoDocumento.nombreTipoRecurso || 'Sin asignar');
    }

    getGroupItemCount(tipoRecurso: string): number {
        // Si el grupo está expandido y tiene items cargados, usar esos
        if (this.expandedGroupsItems.has(tipoRecurso)) {
            return this.expandedGroupsItems.get(tipoRecurso)!.length;
        }
        // Si no, usar el grupo del mapa
        const grupo = this.gruposTipoRecurso.get(tipoRecurso);
        return grupo ? grupo.length : 0;
    }

    getGroupItems(tipoRecurso: string): TipoDocumento[] {
        // Si el grupo está expandido, devolver todos sus items
        if (this.expandedGroupsItems.has(tipoRecurso)) {
            return this.expandedGroupsItems.get(tipoRecurso)!;
        }
        // Si no, devolver los items del grupo del mapa
        const grupo = this.gruposTipoRecurso.get(tipoRecurso);
        return grupo || [];
    }
}

