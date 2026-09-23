import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-usuario-pass',
  templateUrl: './usuario-pass.component.html',
  styleUrls: ['./usuario-pass.component.scss']
})
export class UsuarioPassComponent implements OnInit {
  
  @Input() visible: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

  form: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: UsuarioService
  ) { }

  ngOnInit(): void {

    this.submitted = false;

    this.form = this.formBuilder.group({
      password: ['', [ Validators.required ] ],
      password2: ['', [ Validators.required ] ],
    });
    this.form.reset();
    
  }

  guardar(formValue) {
    this.submitted = true;
    if (this.form.invalid) return;

    const usuario = new Usuario();
    usuario.password = formValue.password;
    usuario.password2 = formValue.password2;

    this.service.updatePassword(usuario).subscribe(resp => {
        this.onResponse.emit(resp);
        if ([200,201].indexOf(resp.code) !== -1) this.close();
    });
  }

  close() {
    this.form.reset();
    this.visibleChange.emit(false);
  }

}
