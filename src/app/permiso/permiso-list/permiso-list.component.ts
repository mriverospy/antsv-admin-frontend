import { Message } from 'primeng/api';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { delay } from 'rxjs/operators';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { MessageResponse } from '../../shared/models/message-response.model';
import { PermissionGuardService } from '../../shared/services/permission-guard.service';
import { Permiso } from './../models/permiso.model';
import { PermisoService } from './../services/permiso.service';

@Component({
  selector: 'app-permiso-list',
  templateUrl: './permiso-list.component.html',
  styleUrls: ['./permiso-list.component.scss']
})
export class PermisoListComponent implements OnInit {
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
  public permisos: Permiso[];
  public entity: Permiso;

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private service: PermisoService,
    private permission: PermissionGuardService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {

    this.breadcrumbService.setItems([
      { label: "Administración" },
      { label: "Permisos", routerLink: ["/permiso"] },
    ]);

    this.searchFormGroup = this.formBuilder.group({
      idPermiso: [],
      nombre: [],
      descripcion: [],
    });

  }

  ngOnInit(): void {
    this.service.connect().pipe(delay(0)).subscribe((l) => { this.loading = l; });
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
        this.loading = false;
        if(response) {
            this.permisos = response.data?.lista;
            this.totalRecords = response.data?.totalRecords;
        }
    }, error => {
        this.loading = false;
    });
  }

  clearFilters(): void {
    this.searchFormGroup.reset();
    this.start = 0;
    this.loadData();
  }

  openNew() {
    this.showDialog = true;
    this.entity = null;
  }

  openEdit(row: Permiso) {
    this.showDialog = true;
    this.entity = {...row};
  }

  changeDialogVisibility($event) {
    this.showDialog = $event;
  }

  onResponse(res: MessageResponse) {
    if (res.code == 200) {
      this.messageService.add({severity: 'success', summary: 'Operación exitosa', detail: 'Operación exitosa', life: 3000});
      this.loadData();
    } else {
      if (res.code < 500) {
        this.messageService.add({severity: 'warn', summary: 'Atención', detail: res.message, life: 3000});
      } else {
        this.messageService.add({severity: 'error', summary: 'Atención', detail: 'Error al procesar la operación', life: 3000});
      }
    }
  }

  delete(row: Permiso) {
    this.confirmationService.confirm({
      message: `Está seguro que desea dar de baja el permiso <b>${row.nombre}</b>?`,
      header: 'Eliminar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.service.delete(row.idPermiso).subscribe(response => {
          if(response?.status == 200) {
            this.messageService.add({severity: 'success', summary: 'Operación exitosa', detail: `El permiso ${row.nombre} se dió de baja con éxito`, life: 3000});
            this.loadData();
          } else {
            this.messageService.add({severity: 'error', summary: 'Atención!', detail: `No se pudo dar de baja`, life: 3000});
          }
        }, error => console.error('Error al eliminar el permiso:', error));
      }
    });
  }

}
