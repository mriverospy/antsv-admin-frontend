import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import {DatePipe} from '@angular/common';
import { Rol } from '../models/rol.model';
import { RolService } from '../services/rol.service';

@Component({
  selector: 'app-rol-form',
  templateUrl: './rol-form.component.html',
  styleUrls: ['./rol-form.component.scss']
})
export class RolFormComponent implements OnInit, OnChanges {

    @Input() row: Rol;
    @Input() visible: boolean;
    @Output() setVisible: EventEmitter<boolean> = new EventEmitter<boolean>(true);
    @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

    form: FormGroup;
    submitted = false;
    datePipe: DatePipe;

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
      this.datePipe = new DatePipe('es-PY');
      this.submitted = false;

      this.form = this.formBuilder.group({
        idRol: [''],
        nombre: ['', [ Validators.required ] ],
        descripcion: ['', [ Validators.required ] ],
      });

      this.formEdit();
    }

    formEdit() {
      if(this.row != null) {
          this.form.controls['idRol'].setValue(this.row?.idRol);
          this.form.controls['nombre'].setValue(this.row?.nombre);
          this.form.controls['descripcion'].setValue(this.row?.descripcion);
      }
    }

    guardar(formValue) {
      this.submitted = true;
      if (this.form.invalid) return;

      const rol = new Rol();
      rol.idRol = formValue.idRol;
      rol.nombre = formValue.nombre;
      rol.descripcion = formValue.descripcion;

      const response = this.row == null
          ? this.service.create(rol)
          : this.service.update(rol.idRol, rol);

      response.subscribe(resp => {
          this.onResponse.emit(resp);
          if ([200,201].indexOf(resp.code) !== -1) this.close();
      });
    }

    close() {
      this.form.reset();
      this.setVisible.emit(false);
    }

  }
