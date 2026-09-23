import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import {DatePipe} from '@angular/common';
import { Permiso } from '../models/permiso.model';
import { PermisoService } from '../services/permiso.service';

@Component({
  selector: 'app-permiso-form',
  templateUrl: './permiso-form.component.html',
  styleUrls: ['./permiso-form.component.scss']
})
export class PermisoFormComponent implements OnInit, OnChanges {

    @Input() row: Permiso;
    @Input() visible: boolean;
    @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>(true);
    @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

    form: FormGroup;
    submitted = false;
    datePipe: DatePipe;
    roles: any[];
    rolFilter: any[] = [];

    constructor(
      private service: PermisoService,
      private formBuilder: FormBuilder
    ) { }

    ngOnChanges(): void {
      this.initComponent();
    }

    ngOnInit(): void {
      this.initComponent();
    }

    initComponent(): void {
      this.datePipe = new DatePipe('es-PY');
      this.submitted = false;

      this.form = this.formBuilder.group({
        idPermiso: [''],
        nombre: ['', [ Validators.required ] ],
        descripcion: ['', [ Validators.required ] ],
      });

      this.formEdit();
    }

    formEdit() {
      if(this.row != null) {
          this.form.controls['idPermiso'].setValue(this.row?.idPermiso);
          this.form.controls['nombre'].setValue(this.row?.nombre);
          this.form.controls['descripcion'].setValue(this.row?.descripcion);
      }
    }

    guardar(formValue) {
      this.submitted = true;
      if (this.form.invalid) return;

      const permiso = new Permiso();
      permiso.idPermiso = formValue.idPermiso;
      permiso.nombre = formValue.nombre;
      permiso.descripcion = formValue.descripcion;

      const response = this.row == null
          ? this.service.create(permiso)
          : this.service.update(permiso.idPermiso, permiso);

      response.subscribe(resp => {
          this.onResponse.emit(resp);
          if ([200,201].indexOf(resp.code) !== -1) this.close();
      });
    }

    close() {
      this.form.reset();
      this.visibleChange.emit(false);
    }

  }
