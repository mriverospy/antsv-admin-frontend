import { Message } from 'primeng/api';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { delay } from 'rxjs/operators';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { RolService } from '../../rol/services/rol.service';
import { MessageResponse } from '../../shared/models/message-response.model';
import { SelectItem } from '../../shared/models/select.model';
import { PermissionGuardService } from '../../shared/services/permission-guard.service';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';
import { isNgTemplate } from '@angular/compiler';
import {MetodoRegistroService} from "../../metodo-registro/services/metodo-registro.service";

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss']
})
export class UsuarioListComponent implements OnInit {
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
  public showForm: boolean = false; // Nueva variable para conditional rendering
  public usuarios: Usuario[];
  public roles: SelectItem[];
  public metodoRegistros: SelectItem[];
  public entity: Usuario;
  public organizacionOptions: SelectItem[] = [];

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private service: UsuarioService,
    private rolService: RolService,
    private permission: PermissionGuardService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private metodoRegistroService: MetodoRegistroService
  ) {

    this.breadcrumbService.setItems([
      { label: "Administración" },
      { label: "Usuarios", routerLink: ["/usuario"] },
    ]);

    this.searchFormGroup = this.formBuilder.group({
      idUsuario: [],
      nombre: [],
      apellido: [],
      username: [],
      roles:[],
      fechaExpiracion: [],
      nroDocumento: [],
      idOrganizacion: [],
    });

  }

  ngOnInit(): void {
    this.service.connect().pipe(delay(0)).subscribe((l) => { this.loading = l; });
    this.loadRoles();
    this.loadMetodoRegistros();
    this.loadOrganizaciones();
  }

  toggleFiltros() {
		this.mostrarFiltros = !this.mostrarFiltros;
	}

  loadOrganizaciones(): void {
    this.service.getOrganizaciones().subscribe({
      next: (response) => {
        if (response && response.code === 200) {
          this.organizacionOptions = [
            { id: null, nombre: 'Todas' },
            ...response.data.map((item: any) => ({
              id: item.idOrganizacion,
              nombre: item.nombre
            }))
          ];
        }
      },
      error: (error) => {
        console.error('Error cargando organizaciones:', error);
        this.organizacionOptions = [
          { id: null, nombre: 'Todas' }
        ];
      }
    });
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
            this.usuarios = response.data?.lista;
            this.totalRecords = response.data?.totalRecords;
        }
    }, error => {
        this.loading = false;
        console.error('Error al cargar los usuarios:', error);
    });
  }

  clearFilters(): void {
    this.searchFormGroup.reset();
    this.start = 0;
    this.loadData();
  }

  applyFilters(): void {
    this.start = 0;
    this.loadData();
  }

  updateStatus(row: Usuario) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${row.estado ? 'desactivar' : 'activar'} el usuario <b>${row.nombre} ${row.apellido}</b>?`,
      header: 'Actualizar estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        // Creamos un objeto temporal con el estado invertido
        const updatedRow = { ...row, estado: !row.estado };

        this.service.updateStatus(row.idUsuario, updatedRow).subscribe(response => {
          if(response?.code == 200) {
            // Actualizamos la UI localmente para no recargar todo
            row.estado = !row.estado;
            this.messageService.add({
              severity: 'success',
              summary: 'Operación exitosa',
              detail: `El usuario ${row.nombre} ${row.apellido} ha cambiado de estado exitosamente`,
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

  loadRoles() {
    this.rolService.getRoles().subscribe({
      next: (response) => {
        if(response && response.code === 200) {
           this.roles = this.getSelectRolData(response.data);
        } else {
          console.error('Respuesta del servicio no exitosa:', response);
        }
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
    });
  }

  loadMetodoRegistros() {
    this.metodoRegistroService.getAll(null, 99999, 0,
        "nombre",
        this.sortAsc,
        ""
    ).subscribe((response) => {
      if(response) {
        this.metodoRegistros = response.data?.lista;
      }
    }, error => {
      this.loading = false;
    });
  }



  getSelectRolData(data): any[] {
    if(data == null || data.length <= 0) {
      return [];
    }
    let itemList = [];
    data.forEach((row: any, index: number) => { 
      const id = row.idRol || row.id;
      const nombre = row.nombre;
      if (id && nombre) {
        itemList = [...itemList, { id: id, nombre: nombre }];
      } else {
        console.warn(`Rol ${index} no tiene ID o nombre válido:`, row);
      }
    });
    return itemList;
 }

  openNew() {
    this.showDialog = false;
    this.showForm = true;
    this.entity = null;
  }

  openEdit(row: Usuario) {
    this.showDialog = false;
    this.showForm = true;
    this.entity = {...row};
  }

  // Nuevo método para volver a la lista
  backToList() {
    this.showForm = false;
    this.entity = null;
  }

  changeDialogVisibility($event) {
    this.showDialog = $event;
    // Si se cierra el dialog (por si acaso), también volvemos a lista
    if (!$event) {
      this.backToList();
    }
  }

  onResponse(res: MessageResponse) {
    if (res.code == 200) {
      this.messageService.add({severity: 'success', summary: 'Operación exitosa', detail: 'Operación exitosa', life: 3000});
      this.loadData();
      this.backToList(); // Volver a la lista después de guardar
    } else {
      if (res.code < 500) {
        this.messageService.add({severity: 'warn', summary: 'Atención', detail: res.message, life: 30000});
      } else {
        this.messageService.add({severity: 'error', summary: 'Atención', detail: 'Error al procesar la operación', life: 30000});
      }
    }
  }

  delete(row: Usuario) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea dar de baja el usuario <b>${row.nombre}</b>?`,
      header: '¡Atención!',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.service.delete(row.idUsuario).subscribe(response => {
            if(response?.code == 200) {
                this.messageService.add({severity: 'success', summary: 'Operación exitosa', detail: response.message, life: 3000});
                this.loadData();
            } else {
                this.messageService.add({severity: 'error', summary: 'Atención!', detail: `No se pudo dar de baja`, life: 3000});
            }
        }, error => console.log(error));
      }
    });
  }

}
