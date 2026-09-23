import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';
import { DatePipe } from '@angular/common';
import { SelectItem } from '../../shared/models/select.model';
import {Rol} from "../../rol/models/rol.model";
import {environment} from "@env/*";
import {MetodoRegistroEnum} from "../../shared/enums/metodo-registro.model";
import {MetodoRegistro} from "../../metodo-registro/models/metodo-registro.model";
import { PermissionGuardService } from "../../shared/services/permission-guard.service";

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss']
})
export class UsuarioFormComponent implements OnInit, OnChanges {

  @Input() row: Usuario;
  @Input() roles: SelectItem[];
  @Input() metodoRegistros: MetodoRegistro[];
  @Input() visible: boolean;
  @Input() isEmbedded: boolean = false;
  @Output() setVisible: EventEmitter<boolean> = new EventEmitter<boolean>(true);
  @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

  form: FormGroup;
  submitted = false;
  datePipe: DatePipe;
  readonly: boolean = false;
  yearStart: number = new Date().getFullYear() -1;
  yearFinal: number = new Date().getFullYear() +5;
  
  // Opciones para el dropdown de tipos de documento
  tiposDocumento = [
    { label: 'Cédula de Identidad', value: 'CI' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
    { label: 'Documento Extranjero', value: 'EXTRANJERO' }
  ];
  
  nacionalidades = [
    { label: 'Paraguaya', value: 'Paraguaya' },
    { label: 'Argentina', value: 'Argentina' },
    { label: 'Brasileña', value: 'Brasileña' },
    { label: 'Boliviana', value: 'Boliviana' },
    { label: 'Uruguaya', value: 'Uruguaya' },
    { label: 'Chilena', value: 'Chilena' },
    { label: 'Peruana', value: 'Peruana' },
    { label: 'Colombiana', value: 'Colombiana' },
    { label: 'Ecuatoriana', value: 'Ecuatoriana' },
    { label: 'Venezolana', value: 'Venezolana' },
    { label: 'Estadounidense', value: 'Estadounidense' },
    { label: 'Mexicana', value: 'Mexicana' },
    { label: 'Canadiense', value: 'Canadiense' },
    { label: 'Costarricense', value: 'Costarricense' },
    { label: 'Guatemalteca', value: 'Guatemalteca' },
    { label: 'Panameña', value: 'Panameña' },
    { label: 'Salvadoreña', value: 'Salvadoreña' },
    { label: 'Otra', value: 'Otra' }
  ];

  // Opciones para el dropdown de organizaciones
  organizacionOptions: any[] = [];
  
  constructor(
    private service: UsuarioService,
    private formBuilder: FormBuilder,
    private permission: PermissionGuardService,
  ) { }

  ngOnChanges(): void {
    this.initComponent();
    this.filtrarRoles();
    // Si ya tenemos datos del usuario y roles, procesar los roles
    if (this.row && this.roles && this.roles.length > 0) {
      this.processUserRoles();
    }

    if (this.row && this.metodoRegistros && this.metodoRegistros.length > 0) {
      this.procesarMetodoRegistros();
    }

    // Si tenemos datos del usuario, ejecutar formEdit
    if (this.row) {
      this.formEdit();
    }
  }

  // Método para determinar si las contraseñas son requeridas
  isPasswordRequired(): boolean {
    return this.row === null || this.row === undefined;
  }



  // Método para procesar los roles del usuario cuando estén disponibles
  private processUserRoles() {
    if (this.row?.roles && this.roles && this.roles.length > 0) {
      const rolesData = this.getSelectRolData(this.row?.roles);
      this.form.controls['roles'].setValue(rolesData);
    }
  }

  private procesarMetodoRegistros() {
    if (this.row?.metodoRegistros && this.metodoRegistros && this.metodoRegistros.length > 0) {
      this.form.controls['metodoRegistros'].setValue(this.row?.metodoRegistros);
    }
  }

 ngOnInit(): void {
  this.initComponent();
  this.loadOrganizaciones();
}

  loadOrganizaciones(): void {
    this.service.getOrganizaciones().subscribe({
      next: (response) => {
        if (response && response.code === 200) {
          this.organizacionOptions = response.data.map((item: any) => ({
            label: item.nombre,
            value: item.idOrganizacion
          }));
        }
      },
      error: (error) => {
        console.error('Error cargando organizaciones:', error);
      }
    });
  }

  initComponent(): void {
    this.datePipe = new DatePipe('es-PY');
    this.submitted = false;

    this.form = this.formBuilder.group({
      idUsuario: [''],
      username: ['', [ Validators.required ] ],
      password: ['', [ Validators.required] ], // Requerido para nuevos usuarios
      password2: ['', [ Validators.required] ], // Requerido para nuevos usuarios
      nombre: ['', [ Validators.required ] ],
      apellido: ['', [  Validators.required] ],
      tipoDocumento: ['CI', [ Validators.required] ], // Cedula de Identidad por defecto
      nacionalidad: ['Paraguaya', [  Validators.required] ],
      fechaExpiracion: ['', [Validators.required] ],
      roles: ['', [ Validators.required ] ],
      organizacion: ['', [Validators.required]], // Nuevo campo requerido
      cargo: [''],
      direccion: [''],
      telefono: ['', [ Validators.required ]],
      correo: ['', [ Validators.required, Validators.email ]],
      nroDocumento: ['', [ Validators.required ]],
      metodoRegistros: ['', []],
    });

    // Solo ejecutar formEdit si ya tenemos datos del usuario
    if (this.row) {
      this.formEdit();
    }
  }

  formEdit() {
    this.readonly = false;
    const datepipe: DatePipe = new DatePipe('en-PY');
    this.form.reset();
    if(this.row != null) {
        this.readonly = true;      
        this.form.controls['idUsuario'].setValue(this.row?.idUsuario);
        this.form.controls['username'].setValue(this.row?.username);
        this.form.controls['nombre'].setValue(this.row?.nombre);
        this.form.controls['apellido'].setValue(this.row?.apellido);
        this.form.controls['tipoDocumento'].setValue(this.row?.tipoDocumento || 'CI');
        this.form.controls['nacionalidad'].setValue(this.row?.nacionalidad || 'Paraguaya');
        this.form.controls['nroDocumento'].setValue(this.row?.nroDocumento);
        this.form.controls['fechaExpiracion'].setValue(datepipe.transform(this.row?.fechaExpiracion, 'dd-MM-YYYY'));
        
        // Solo procesar roles si están disponibles
        if (this.roles && this.roles.length > 0) {
          this.processUserRoles();
        }
        
        this.form.controls['cargo'].setValue(this.row?.cargo);
        this.form.controls['direccion'].setValue(this.row?.direccion);
        this.form.controls['telefono'].setValue(this.row?.telefono);
        this.form.controls['correo'].setValue(this.row?.correo);
        this.form.controls['organizacion'].setValue(this.row?.idOrganizacion);

        // Solo procesar roles si están disponibles
        if (this.metodoRegistros && this.metodoRegistros.length > 0) {
          this.procesarMetodoRegistros();
        }

        // Para edición, las contraseñas no son requeridas por defecto
        this.form.controls['password'].setValidators([]);
        this.form.controls['password2'].setValidators([]);
        this.form.controls['password'].updateValueAndValidity();
        this.form.controls['password2'].updateValueAndValidity();
    }
    this.form.controls['metodoRegistros'].disable();

  }

 getSelectRolData(data): any[] {

   if(data == null || data.length <= 0) {
     return [];
   }

   let itemList = [];

   data.forEach((row: any, index: number) => {
     // Manejar tanto roles del backend (con idRol) como del frontend (con id)
     const id = row.idRol || row.id;
     const nombre = row.nombre;

     if (id && nombre) {
       const item = { id: id, nombre: nombre };
       itemList = [...itemList, item];
     }
   });

   return itemList;

 }


  guardar(formValue) {
    this.submitted = true;
    if (this.form.invalid) return;

    // Validar que los campos requeridos no sean undefined
    if (!formValue.username || !formValue.nombre || !formValue.apellido || !formValue.roles || !formValue.organizacion || !formValue.fechaExpiracion) {
      return;
    }

    const usuario = new Usuario();
    // Usar formValue.idUsuario o this.row.idUsuario como respaldo
    usuario.idUsuario = formValue.idUsuario || this.row?.idUsuario || null;
    
    // Si aún es null, intentar obtenerlo directamente del formulario
    if (!usuario.idUsuario) {
      usuario.idUsuario = this.form.get('idUsuario')?.value || this.row?.idUsuario || null;
    }
    usuario.username = formValue.username;
    usuario.password = formValue.password;
    usuario.password2 = formValue.password2;
    usuario.nombre = formValue.nombre;
    usuario.apellido = formValue.apellido;
    usuario.tipoDocumento = formValue.tipoDocumento;
    usuario.nroDocumento = formValue.nroDocumento;
    usuario.fechaExpiracion = formValue.fechaExpiracion;
    usuario.nacionalidad = formValue.nacionalidad;
    usuario.roles = formValue.roles;
    usuario.idOrganizacion = formValue.organizacion; // Nuevo campo
    usuario.cargo = formValue.cargo;
    usuario.direccion = formValue.direccion;
    usuario.telefono = formValue.telefono;
    usuario.correo = formValue.correo;
    usuario.metodoRegistros = this.row?.metodoRegistros ? this.row?.metodoRegistros : this.buscarMetodoRegistro(MetodoRegistroEnum.MENU_USUARIO);

    // Verificar que tenemos un ID válido para actualización
    if (this.row == null) {
      // Crear nuevo usuario
      this.service.create(usuario).subscribe(resp => {
        this.onResponse.emit(resp);
        if ([200,201].indexOf(resp.code) !== -1) this.close();
      });
    } else {
      // Actualizar usuario existente
      if (usuario.idUsuario && usuario.idUsuario > 0) {
        this.service.update(usuario.idUsuario, usuario).subscribe(resp => {
          this.onResponse.emit(resp);
          if ([200,201].indexOf(resp.code) !== -1) this.close();
        });
      } else {
        console.error('ID de usuario inválido para actualización:', usuario.idUsuario);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    }
  }

  close() {
    this.form.reset();
    this.setVisible.emit(false);
  }

  // Método para manejar validación condicional de contraseñas
  onPasswordChange() {
    const password = this.form.get('password')?.value;
    const password2 = this.form.get('password2')?.value;
    
    if (password && password.trim() !== '') {
      // Si se llena password, ambos campos son requeridos
      this.form.controls['password'].setValidators([Validators.required]);
      this.form.controls['password2'].setValidators([Validators.required]);
      
      // Si ambos campos tienen valor, verificar que coincidan
      if (password2 && password2.trim() !== '') {
        if (password !== password2) {
          this.form.controls['password2'].setErrors({ passwordMismatch: true });
        } else {
          this.form.controls['password2'].setErrors(null);
        }
      }
    } else {
      // Si password está vacío, ninguno es requerido
      this.form.controls['password'].setValidators([]);
      this.form.controls['password2'].setValidators([]);
      // Limpiar password2 si password está vacío
      this.form.controls['password2'].setValue('');
      this.form.controls['password2'].setErrors(null);
    }
    
    this.form.controls['password'].updateValueAndValidity();
    this.form.controls['password2'].updateValueAndValidity();
  }

  private filtrarRoles() {
    if (!this.roles || this.roles.length === 0) {
      return;
    }

    // Verificar que row existe antes de acceder a roles
    const rolesAsignados = (this.row && this.row.roles) ? this.row.roles : [];

    let itemList = [];
    const excluirRoles = this.obtenerRolesAExcluir();

    this.roles.forEach((role: any, index: number) => {
      const id = role.id;
      const nombre = role.nombre;

      if (
        id &&
        nombre &&
        (
          !excluirRoles.includes(nombre) ||
          this.tieneRolAdmin(rolesAsignados, excluirRoles)
        )
      ) {
        itemList.push(role);
      }
    });

    this.roles = itemList;
  }


  private obtenerRolesAExcluir() {
    const rolesAExcluir = environment.lista_roles_admin;
    return rolesAExcluir.split(",");
  }
  /*
  * Si es usuario tiene roles admin
  * no se excluyen los roles de la lista admin
  * */
  private tieneRolAdmin(rolesAsignados: Rol[], excluirRoles: string[]) {

    const sessionRaw = localStorage.getItem('ngx_current_user');
    if (!sessionRaw) {
      console.warn('No se encontró sesión del usuario');
      return false;
    }

    const session = JSON.parse(sessionRaw);

    for (const rolAsignado of session.usuario.roles) {
      if(excluirRoles.includes(rolAsignado.nombre)){
        return true;
      }
    }
    return false;
  }

  private buscarMetodoRegistro(MENU_USUARIO: string) {
    for (const metodoRegistro of this.metodoRegistros) {
      if(metodoRegistro.codigo == MENU_USUARIO){
        return [metodoRegistro];
      }
    }
    return undefined;
  }

  checkPermission(nombre: string): boolean {
        return this.permission.hasPermission(nombre);
  }

}
