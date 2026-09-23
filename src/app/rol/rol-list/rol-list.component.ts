import { Message } from 'primeng/api';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { delay } from 'rxjs/operators';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { Permiso } from '../../permiso/models/permiso.model';
import { PermisoService } from '../../permiso/services/permiso.service';
import { MessageResponse } from '../../shared/models/message-response.model';
import { PermissionGuardService } from '../../shared/services/permission-guard.service';
import { Rol } from './../models/rol.model';
import { RolService } from './../services/rol.service';

@Component({
  selector: 'app-rol-list',
  templateUrl: './rol-list.component.html',
  styleUrls: ['./rol-list.component.scss']
})
export class RolListComponent implements OnInit {
  mostrarFiltros: boolean = false;
  @ViewChild("table") table: Table;

  public msgs: Message[] = [];
  public searchFormGroup: FormGroup;
  public pageSize: number = 10;
  public start: number = 0;
  public filter: string;
  public totalRecords: number = 0;
  public sortAsc: boolean = true;
  public sortField: string;

  public loading: boolean = true;
  public showDialog: boolean;
  public showDialogPermiso: boolean;
  public roles: Rol[];
  public permisos: Permiso[];
  public entity: Rol;

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private service: RolService,
    private servicePermiso: PermisoService,
    private permission: PermissionGuardService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {

    this.breadcrumbService.setItems([
      { label: "Administración" },
      { label: "Roles", routerLink: ["/rol"] },
    ]);

    this.searchFormGroup = this.formBuilder.group({
      idRol: [],
      nombre: [],
      descripcion: [],
    });

  }

  ngOnInit(): void {
    this.service.connect().pipe(delay(0)).subscribe((l) => { this.loading = l; });
    this.loadPermisos();
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  ngOnDestroy(): void {
    this.service.disconnet();
  }

  checkPermission(nombre: string): boolean {
    return this.permission.hasPermission(nombre);
  }

  load($event: any) {
    this.filter = $event?.globalFilter ? $event.globalFilter : null;
    this.start = $event?.first;
    this.pageSize = $event?.rows ? $event.rows : null;
    this.sortField = $event?.sortField;
    this.sortAsc = $event?.sortOrder == 1 ? true : false;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll(this.filter, this.pageSize, this.start, this.sortField, this.sortAsc, this.searchFormGroup.value).subscribe((response) => {
      if (response) {
        this.roles = response.data?.lista;
        this.totalRecords = response.data?.totalRecords;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.error('Error al cargar los roles:', error);
    });
  }

  clearFilters(): void {
    this.searchFormGroup.reset();
    this.start = 0;
    this.loadData();
  }

  loadPermisos() {
    this.servicePermiso.getPermisos().subscribe((response) => {
      if (response) {
        this.permisos = response.data;
      }
    }, error => {
      console.error('Error al cargar los permisos:', error);
    });
  }

  openNew() {
    this.showDialog = true;
    this.showDialogPermiso = false;
    this.entity = null;
  }

  openEdit(row: Rol) {
    this.showDialog = true;
    this.showDialogPermiso = false;
    this.entity = { ...row };
  }

  openEditPermiso(row: Rol) {
    this.showDialogPermiso = true;
    this.showDialog = false;
    this.entity = { ...row };
  }

  changeDialogVisibility($event) {
    this.showDialog = $event;
  }

  changeDialogVisibilityPermiso($event) {
    this.showDialogPermiso = $event;
  }

  onResponse(res: MessageResponse) {
    if (res.code == 200) {
      this.messageService.add({ severity: 'success', summary: 'Operación exitosa', detail: 'Operación exitosa', life: 3000 });
      this.loadData();
    } else {
      if (res.code < 500) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: res.message, life: 3000 });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Atención', detail: 'Error al procesar la operación', life: 3000 });
      }
    }
  }

  delete(row: Rol) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${row.estado ? 'dar de baja' : 'habilitar'} el rol <b>${row.nombre}</b>?`,
      header: '¡Atención!',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.service.delete(row.idRol).subscribe(response => {
          if (response?.code == 200) {
            this.messageService.add({ severity: 'success', summary: 'Operación exitosa', detail: response.message, life: 3000 });
            this.loadData();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Atención!', detail: `No se pudo realizar la operación`, life: 3000 });
          }
        }, error => console.error('Error al eliminar el rol:', error));
      }
    });
  }

  updateStatus(row: Rol) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${row.estado ? 'desactivar' : 'activar'} el rol <b>${row.nombre}</b>?`,
      header: 'Actualizar estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        // Crear un objeto Rol con el estado invertido
        const rolActualizado = { ...row, estado: !row.estado };
        this.service.updateStatus(row.idRol, rolActualizado).subscribe(response => {
          if (response?.code == 200) {
            // Actualizamos la UI localmente para no recargar todo
            row.estado = !row.estado;
            this.messageService.add({
              severity: 'success',
              summary: 'Operación exitosa',
              detail: `El rol ${row.nombre} ha cambiado de estado exitosamente`,
              life: 3000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Atención!',
              detail: `No se pudo actualizar el estado.`,
              life: 3000
            });
          }
        }, error => {
          console.error('Error al actualizar el estado del rol:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error!',
            detail: 'Ocurrió un error al intentar actualizar el estado',
            life: 3000
          });
        });
      }
    });
  }

}
