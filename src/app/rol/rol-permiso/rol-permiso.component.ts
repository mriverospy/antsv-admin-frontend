import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { Rol } from '../models/rol.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RolService } from '../services/rol.service';
import { Permiso } from '../../permiso/models/permiso.model';
import { RolPermiso } from '../models/rol-permiso.model';

@Component({
  selector: 'app-rol-permiso',
  templateUrl: './rol-permiso.component.html',
  styleUrls: ['./rol-permiso.component.scss']
})
export class RolPermisoComponent implements OnInit {

    @Input() row: Rol;
    @Input() permisos: Permiso[];
    @Input() visible: boolean;
    @Output() setVisible: EventEmitter<boolean> = new EventEmitter<boolean>(true);
    @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

    form: FormGroup;
    submitted = false;
    permisosAsociados: Permiso[];
    todosLosPermisos: Permiso[];

    constructor(
        private service: RolService,
        private formBuilder: FormBuilder
    ) { }

    ngOnChanges(): void {
        this.initComponent();
    }

    ngOnInit(): void {
        this.initComponent();
    }

    initComponent(): void {
        this.permisosAsociados = [];
        this.submitted = false;
        this.form = this.formBuilder.group({ permiso: [[]] });
        this.onShowPermiss();
    }

    onShowPermiss() {
        this.todosLosPermisos = this.permisos;
        if(this.row?.permisos !== undefined) {
            this.todosLosPermisos = this.permisos.filter(p => !this.verifyMyPermiss(p));
            this.permisosAsociados = this.row?.permisos;
        }
    }

    verifyMyPermiss(permiso: Permiso): boolean {
        const results = this.row?.permisos.filter(p => p.idPermiso === permiso.idPermiso);
        return results != null && results.length > 0 ? true : false;
    }

    guardar() {
        this.submitted = true;
        if (this.permisosAsociados.length <= 0) return;

        let rolPermiso = new RolPermiso();
        rolPermiso.rol = this.row;
        rolPermiso.permisos = this.permisosAsociados;

        this.service.asociarPermisos(rolPermiso).subscribe(resp => {
            this.onResponse.emit(resp);
            if ([200,201].indexOf(resp.code) !== -1) this.close();
        });
    }

    close() {
        this.form.reset();
        this.setVisible.emit(false);
    }

}
