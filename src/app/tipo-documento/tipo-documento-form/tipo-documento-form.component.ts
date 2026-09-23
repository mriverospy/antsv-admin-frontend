import { Component, EventEmitter, Input, OnInit, Output, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TipoDocumentoService } from '../services/tipo-documento.service';
import { FormBaseDynamic } from 'src/app/shared/gh-form-base-dynamic/gh-form-base-dynamic.component';
import { TipoDocumento } from '../models/tipo-documento.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tipo-documento-form',
  templateUrl: './tipo-documento-form.component.html',
  styleUrls: ['./tipo-documento-form.component.scss']
})
export class TipoDocumentoFormComponent implements OnInit, AfterViewInit {

  @Input() row: TipoDocumento;
  @Input() visible: boolean;
  @Input() isViewMode: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onResponse = new EventEmitter<any>();
  @Output() setVisible: EventEmitter<boolean> = new EventEmitter<boolean>(true);
  @ViewChild('formBase') formBase: FormBaseDynamic;
  
  activeTabIndex: number = 0;
  formConfig: any[] = [];
  isFormReady: boolean = false;

  tipoRecursoOptions: Array<{label: string, value: number}> = [];

  constructor(
    private tipoDocumentoService: TipoDocumentoService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Inicializar formConfig vacío primero para que el formulario se renderice
    this.initializeFormConfig();
    // Cargar tipos de recurso en background
    this.loadTiposRecurso();
  }

  loadTiposRecurso(): void {
    this.tipoDocumentoService.getTiposRecurso().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.tipoRecursoOptions = response.data as Array<{label: string, value: number}>;
          // Actualizar formConfig con las opciones cargadas
          const tipoRecursoField = this.formConfig[0]?.fields.find((f: any) => f.name === 'idTipoRecurso');
          if (tipoRecursoField) {
            tipoRecursoField.options = this.tipoRecursoOptions;
            // Usar el método updateFieldOptions de FormBaseDynamic para forzar la actualización
            if (this.formBase) {
              this.formBase.updateFieldOptions('idTipoRecurso', this.tipoRecursoOptions);
            }
          }
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
  
  ngAfterViewInit(): void {
    this.isFormReady = true;
  }

  private initializeFormConfig() {
    this.formConfig = [
      {
        label: 'Información del Tipo de Documento',
        fields: [
          { 
            type: 'text', 
            name: 'nombre', 
            label: 'Nombre (*)', 
            required: true, 
            validations: [Validators.required, Validators.maxLength(100)], 
            columns: 12, 
            disabled: this.isViewMode, 
            placeholder: 'Ingrese el nombre del tipo de documento' 
          },
          { 
            type: 'dropdown', 
            name: 'idTipoRecurso', 
            label: 'Tipo de Recurso (*)', 
            required: true, 
            validations: [Validators.required], 
            columns: 12, 
            disabled: this.isViewMode, 
            options: this.tipoRecursoOptions,
            optionLabel: 'label',
            optionValue: 'value',
            placeholder: 'Seleccione el tipo de recurso' 
          },
          { 
            type: 'textarea', 
            name: 'descripcion', 
            label: 'Descripción', 
            validations: [Validators.maxLength(500)], 
            columns: 12, 
            disabled: this.isViewMode, 
            placeholder: 'Ingrese una descripción (opcional)',
            rows: 3
          },
          ...(!this.isViewMode ? [
            { type: 'submit', name: 'btnGuardar', label: this.row && this.row.idTipoDocumento && this.row.idTipoDocumento > 0 ? 'Actualizar' : 'Guardar', icon: 'pi pi-check', class: 'p-button-primary p-button-rounded', columns: 6 },
            { type: 'button', name: 'btnCancelar', label: 'Cancelar', icon: 'pi pi-times', class: 'p-button-secondary p-button-rounded', columns: 6, callback: () => this.cancelar() },
          ] : [{ type: 'button', name: 'btnCancelar', label: 'Cancelar', icon: 'pi pi-times', class: 'p-button-secondary p-button-rounded', columns: 6, callback: () => this.cancelar() }])
        ]
      }
    ];
  }

  onDialogShow(): void {
    if (this.formBase) {
      this.formBase.resetValidationState();
    }

    if (this.row) {
      setTimeout(() => {
        if (this.formBase) {
          const formData: any = {
            nombre: this.row.nombre || '',
            descripcion: this.row.descripcion || '',
            idTipoRecurso: this.row.idTipoRecurso || null,
          };

          this.formBase.updateFormValues(formData);
        }
      }, 200);
    }
  }


  handleFormResponse(formData: any): void {
    const isUpdate = this.row && this.row.idTipoDocumento && this.row.idTipoDocumento > 0;
    const dto: any = {
      nombre: formData.nombre,
      idTipoRecurso: formData.idTipoRecurso,
      descripcion: formData.descripcion || null,
      estado: this.row?.estado !== undefined ? this.row.estado : true
    };

    if (isUpdate) {
      dto.idTipoDocumento = this.row.idTipoDocumento;
    }

    const operation = isUpdate
      ? this.tipoDocumentoService.update(dto.idTipoDocumento, dto)
      : this.tipoDocumentoService.create(dto);

    operation.subscribe({
      next: (response) => {
        if (response?.code === 200 || response?.code === 201) {
          this.onResponse.emit({
            success: true,
            message: isUpdate ? 'Tipo de documento actualizado exitosamente' : 'Tipo de documento creado exitosamente'
          });
          this.cerrarModal();
        } else {
          this.onResponse.emit({ success: false, message: response.message });
        }
      },
      error: (error) => {
        console.error('Service error:', error);
        this.onResponse.emit({
          success: false,
          message: error.error?.message || 'Error en la operación'
        });
      }
    });
  }

  cancelar(): void {
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.setVisible.emit(false);
  }
}

