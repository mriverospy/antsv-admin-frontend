import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges, AfterViewInit, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ArchivoService } from '../services/archivo.service';
import { FormBaseDynamic } from 'src/app/shared/gh-form-base-dynamic/gh-form-base-dynamic.component';
import { Archivo } from '../models/archivo.model';
import { ChangeDetectorRef } from '@angular/core';
import { TipoDocumentoService } from 'src/app/tipo-documento/services/tipo-documento.service';
import { RegistroDocumentoService } from 'src/app/shared/services/registro-documento.service';

@Component({
  selector: 'app-archivo-form',
  templateUrl: './archivo-form.component.html',
  styleUrls: ['./archivo-form.component.scss']
})
export class ArchivoFormComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() row: Archivo;
  @Input() visible: boolean;
  @Input() isViewMode: boolean = false;
  @Input() idRecurso?: number;
  @Input() idEntity?: number;
  @Input() tipoRecurso?: string;

  @Input() fileType: string[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onResponse = new EventEmitter<any>();

  @ViewChild('formBase') formBase: FormBaseDynamic;

  formConfig: any[] = [];
  imagenPreview: string | null = null;
  isFormReady: boolean = false;
  archivoInfo: any = null; // Para mostrar información del archivo cuando no es imagen

  tipoArchivo: any[] = [];
  tipoDocumentoOptions: Array<{ label: string, value: number }> = [];

  // Validacion de archivos
  maxFilesize: number = 10 * 1024 * 1024; // 10MB default
  maxImageFilesize: number = 10 * 1024 * 1024; // 10MB por defecto para imagenes
  maxVideoFilesize: number = 50 * 1024 * 1024; // 50MB por defecto para videos
  allowedMimeTypes: string[] = [];
  allowedExtensions: string[] = [];
  allowedDocumentExtensions: string[] = [];
  allowedImageExtensions: string[] = [];
  allowedVideoExtensions: string[] = [];
  private validationsLoaded = false;

  constructor(
    private archivoService: ArchivoService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private tipoDocumentoService: TipoDocumentoService,
    private ngZone: NgZone,
    private registroDocumentoService: RegistroDocumentoService
  ) { }

  ngOnInit(): void {
    this.cargarFileType();
    this.initializeFormConfig();
    this.loadFileValidations();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit(): void {
    this.isFormReady = true;
    if (this.visible) this.onDialogShow();
  }

  private initializeFormConfig() {
    const fields = [];

    if (this.fileType.length > 1) {
      let initTipoArchivo: string | undefined;
      if (!this.row && this.tipoArchivo.length > 0) {
        const documentoOption = this.tipoArchivo.find(opt => opt.value === 'DOCUMENTO');
        initTipoArchivo = documentoOption ? documentoOption.value : this.tipoArchivo[0].value;
      }

      fields.push({
        type: 'selectButton',
        name: 'tipoArchivo',
        label: 'Tipo Archivo (*)',
        required: true,
        options: this.tipoArchivo,
        columns: 12,
        disabled: this.isViewMode,
        initValue: initTipoArchivo
      });
    }

    if (this.tipoRecurso) {
      let initTipoDocumento: number | undefined;
      if (!this.row && this.tipoDocumentoOptions.length > 0) {
        initTipoDocumento = this.tipoDocumentoOptions[0].value;
      }

      fields.push({
        type: 'dropdown',
        name: 'idTipoDocumento',
        label: 'Tipo Documento',
        required: false,
        options: this.tipoDocumentoOptions,
        optionLabel: 'label',
        optionValue: 'value',
        columns: 12,
        disabled: this.isViewMode,
        placeholder: 'Seleccione un tipo de documento',
        initValue: initTipoDocumento
      });
    }

    let initialShowPreview = true;

    if (this.fileType.length === 1) {
      initialShowPreview = (this.fileType[0] === 'IMAGEN');
    } else {
      initialShowPreview = true;
    }

    if (!this.isViewMode || (this.isViewMode && this.row && this.row.tipoArchivo === 'IMAGEN')) {
      let acceptAttribute = '';
      let allowedExts = '';

      if (this.fileType.length === 1) {
        if (this.fileType[0] === 'IMAGEN') {
          acceptAttribute = this.allowedImageExtensions.map(ext => '.' + ext).join(',');
          allowedExts = this.allowedImageExtensions.join(',');
        } else if (this.fileType[0] === 'DOCUMENTO') {
          acceptAttribute = this.allowedDocumentExtensions.map(ext => '.' + ext).join(',');
          allowedExts = this.allowedDocumentExtensions.join(',');
        } else if (this.fileType[0] === 'VIDEO') {
          acceptAttribute = this.allowedVideoExtensions.map(ext => '.' + ext).join(',');
          allowedExts = this.allowedVideoExtensions.join(',');
        }
      } else {
        acceptAttribute = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].map(ext => '.' + ext).join(',');
        allowedExts = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].join(',');
      }

      fields.push({
        type: 'file',
        name: 'base64Data',
        label: 'Archivo',
        required: !this.isViewMode,
        multiple: false,
        description: this.isViewMode ? 'Vista previa de la imagen' : 'Seleccione un archivo (máx. ' + (this.maxFilesize / (1024 * 1024)) + ' MB)',
        columns: 12,
        showPreview: this.isViewMode ? true : initialShowPreview,
        disabled: this.isViewMode,
        accept: acceptAttribute,
        allowedExtensions: allowedExts
      });
    }

    if (!this.isViewMode) {
      fields.push({
        type: 'submit',
        name: 'btnGuardar',
        label: this.row ? 'Actualizar' : 'Guardar',
        icon: 'pi pi-check',
        class: 'p-button-primary p-button-rounded',
        columns: 6
      });
      fields.push({
        type: 'button',
        name: 'btnCancelar',
        label: 'Cancelar',
        icon: 'pi pi-times',
        class: 'p-button-secondary p-button-rounded',
        columns: 6,
        callback: () => this.cancelar()
      });
    }

    this.formConfig = [{ label: 'Información del Archivo', fields }];
  }

  cancelar() {
    if (this.formBase) this.formBase.resetForm();
    this.cerrarModal();
  }

  cerrarModal() {
    this.imagenPreview = null;
    this.archivoInfo = null;
    this.visible = false;
    this.visibleChange.emit(this.visible);
    if (this.formBase) {
      this.formBase.resetValidationState();
      this.formBase.resetForm();
    }
  }

  handleFormResponse(formData: any) {
    if (this.isViewMode) return;

    const archivoSeleccionado = formData.base64Data;
    let archivoBase64 = '';
    let nombreArchivo = '';
    let tipoMime = 'application/octet-stream';

    if (archivoSeleccionado) {
      if (typeof archivoSeleccionado === 'string') {
        const [nombre, base64] = archivoSeleccionado.split(',', 2);
        archivoBase64 = archivoSeleccionado;
        nombreArchivo = nombre;
      } else {
        archivoBase64 = archivoSeleccionado.data;
        nombreArchivo = archivoSeleccionado.name || 'archivo';
        tipoMime = archivoSeleccionado.type || tipoMime;
      }
    }
    const dto: any = {
      idArchivo: this.row?.idArchivo,
      referenciaArchivo: `${nombreArchivo},${archivoBase64}`,
      nombreArchivo,
      archivoBase64,
      tipoMime,
      estado: true,
      idRecurso: this.idRecurso,
      idEntity: this.idEntity,
      tipoRecurso: this.tipoRecurso || 'INDICADOR',
      tipoArchivo: this.fileType.length === 1
        ? this.fileType[0]
        : formData.tipoArchivo,
      idTipoDocumento: formData.idTipoDocumento || null
    };

    const operation = dto.idArchivo
      ? this.archivoService.update(dto.idArchivo, dto)
      : this.archivoService.create(dto);

    operation.subscribe({
      next: (response) => {
        if (response?.code === 200) {
          this.onResponse.emit({
            success: true,
            message: dto.idArchivo
              ? 'Archivo actualizado exitosamente'
              : 'Archivo creado exitosamente',
            data: response.data
          });
          this.cerrarModal();
        } else {
          this.onResponse.emit({ success: false, message: response.message });
        }
      },
      error: (error) => {
        console.error('Error:', error);
        let backendMsg = error?.error?.message || error?.message || '';
        let userMessage = 'Error en la operación';
        if (
          error?.status === 409 && (
            backendMsg.includes('value too long for type character varying(100)') ||
            backendMsg.includes('DataIntegrityViolationException') ||
            backendMsg.includes('could not execute statement')
          )
        ) {
          userMessage = 'El nombre del archivo es muy largo. Por favor, utilice un nombre de hasta 100 caracteres.';
        }
        this.onResponse.emit({
          success: false,
          message: userMessage
        });
      }
    });
  }

  private isDialogShowExecuting = false;

  onDialogShow() {
    if (this.isDialogShowExecuting) {
      return;
    }

    if (!this.isFormReady || !this.formBase?.dynamicForm) {
      setTimeout(() => this.onDialogShow(), 100);
      return;
    }

    this.isDialogShowExecuting = true;

    const isEditMode = !!(this.row && this.row.idArchivo);

    if (!isEditMode && this.tipoRecurso && this.tipoDocumentoOptions.length === 0 && !this.isLoadingTipoDocumento) {
      this.loadTipoDocumentoOptions();
      const waitForOptions = () => {
        if (this.tipoDocumentoOptions.length > 0 || !this.isLoadingTipoDocumento) {
          this.processDialogShow(isEditMode);
        } else {
          setTimeout(() => waitForOptions(), 100);
        }
      };
      setTimeout(() => waitForOptions(), 200);
    } else {
      this.processDialogShow(isEditMode);
    }
  }

  private processDialogShow(isEditMode: boolean) {
    if (isEditMode) {
      this.formBase.resetValidationState();
      const formData: any = {
        base64Data: this.row.archivoBase64 || '',
        estado: this.row.estado ?? true,
        tipoArchivo: this.row.tipoArchivo,
        idTipoDocumento: this.row.idTipoDocumento
      };

      if (this.row.archivoBase64 && this.row.tipoArchivo === 'IMAGEN') {
        this.imagenPreview = this.row.archivoBase64.startsWith('data:')
          ? this.row.archivoBase64
          : `data:image/jpeg;base64,${this.row.archivoBase64}`;
        this.archivoInfo = {
          nombre: this.row.nombreArchivo,
          tipo: this.row.tipoArchivo,
          mimeType: this.row.tipoMime,
          fechaCreacion: this.row.fechaCreacion,
          tieneArchivo: true,
          esImagen: true
        };
        setTimeout(() => this.formBase?.setImagePreview('base64Data', this.imagenPreview), 0);
      }

      this.formBase.updateFormValues(formData);
      this.isDialogShowExecuting = false;
    } else {
      if (this.fileType.length > 1) {
        const tipoArchivoField = this.formConfig[0]?.fields.find((f: any) => f.name === 'tipoArchivo');
        if (tipoArchivoField?.initValue) {
          setTimeout(() => {
            this.updateFilePreview(tipoArchivoField.initValue);
          }, 0);
        }
      }
      this.isDialogShowExecuting = false; 
    }

    if (!isEditMode) {
      const control = this.formBase.dynamicForm.get('tipoArchivo');
      if (control && !control['_valueChangesSubscription']) {
        control['_valueChangesSubscription'] = control.valueChanges.subscribe(value => {
          if (value) {
            this.updateFilePreview(value);
          }
        });
      }
    }
  }

  private cargarFileType(): void {
    if (this.fileType && this.fileType.length > 0) {
      this.tipoArchivo = this.fileType.map((item: any) => ({
        label: item,
        value: item
      }));
      this.updateDropdownOptions();
    }
  }

  private updateDropdownOptions(): void {
    const dropdownField = this.formConfig[0]?.fields.find((f: any) => f.name === 'tipoArchivo');
    if (dropdownField) {
      dropdownField.options = this.tipoArchivo;
    }
  }

  private isLoadingTipoDocumento = false;

  loadTipoDocumentoOptions(): void {
    if (!this.tipoRecurso || this.isLoadingTipoDocumento) return;

    this.isLoadingTipoDocumento = true;
    this.tipoDocumentoService.getByTipoRecurso(this.tipoRecurso).subscribe({
      next: (response) => {
        this.isLoadingTipoDocumento = false;
        if (response?.code === 200 && response.data) {
          this.tipoDocumentoOptions = (response.data as any[]).map(td => ({
            label: td.nombre,
            value: td.idTipoDocumento
          }));

          const tipoDocField = this.formConfig[0]?.fields.find((f: any) => f.name === 'idTipoDocumento');
          if (tipoDocField) {
            tipoDocField.options = this.tipoDocumentoOptions;
            this.cdr.detectChanges();
          }

          if (!this.row && this.formBase?.dynamicForm && this.visible) {
            setTimeout(() => this.applyDefaultValues(), 500);
          }
        }
      },
      error: () => {
        this.isLoadingTipoDocumento = false;
        this.tipoDocumentoOptions = [];
      }
    });
  }

  private applyDefaultValues(attempts = 0): void {
    if (attempts > 10) return;

    if (!this.formBase?.dynamicForm) {
      setTimeout(() => this.applyDefaultValues(attempts + 1), 100);
      return;
    }

    this.ngZone.run(() => {
      if (this.tipoDocumentoOptions.length > 0) {
        const control = this.formBase.dynamicForm.get('idTipoDocumento');
        if (control) {
          const defaultValue = this.tipoDocumentoOptions[0].value;
          if (!control.value || control.value !== defaultValue) {
            control.setValue(defaultValue, { emitEvent: true });
            control.markAsTouched();
            control.updateValueAndValidity({ emitEvent: true });
          }
        }
      }

      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  private lastTipo: string | null = null;

  private updateFilePreview(tipoParam: string | any) {
    const tipo = typeof tipoParam === 'object' && tipoParam?.value ? tipoParam.value : tipoParam;

    if (!tipo || this.lastTipo === tipo) return;

    const fileField = this.formConfig[0]?.fields.find((f: any) => f.name === 'base64Data');
    if (fileField) {
      fileField.showPreview = (tipo === 'IMAGEN');

      console.log('updateFilePreview - tipo:', tipo);
      if (tipo === 'IMAGEN') {
        fileField.accept = this.allowedImageExtensions.map(ext => '.' + ext).join(',');
        fileField.allowedExtensions = this.allowedImageExtensions.join(',');
      } else if (tipo === 'DOCUMENTO') {
        fileField.accept = this.allowedDocumentExtensions.map(ext => '.' + ext).join(',');
        fileField.allowedExtensions = this.allowedDocumentExtensions.join(',');
      } else if (tipo === 'VIDEO') {
        console.log('Es un video');
        fileField.accept = this.allowedVideoExtensions.map(ext => '.' + ext).join(',');
        fileField.allowedExtensions = this.allowedVideoExtensions.join(',');
      } else {
        fileField.accept = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].map(ext => '.' + ext).join(',');
        fileField.allowedExtensions = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].join(',');
      }

      // Set per-type maxFileSize and description so UI shows correct limits
      if (tipo === 'IMAGEN') {
        fileField.maxFileSize = this.maxImageFilesize;
        const maxMB = Math.round(this.maxImageFilesize / (1024 * 1024));
        fileField.description = this.isViewMode ? 'Vista previa de la imagen' : 'Seleccione un archivo (máx. ' + maxMB + ' MB)';
      } else if (tipo === 'VIDEO') {
        fileField.maxFileSize = this.maxVideoFilesize;
        const maxMB = Math.round(this.maxVideoFilesize / (1024 * 1024));
        fileField.description = this.isViewMode ? 'Vista previa del video' : 'Seleccione un archivo (máx. ' + maxMB + ' MB)';
      } else {
        fileField.maxFileSize = this.maxFilesize;
        const maxMB = Math.round(this.maxFilesize / (1024 * 1024));
        fileField.description = this.isViewMode ? 'Vista previa del archivo' : 'Seleccione un archivo (máx. ' + maxMB + ' MB)';
      }

      const currentFile = this.formBase?.dynamicForm.get('base64Data')?.value;
      if (this.formBase && currentFile && !this.row) {
        this.formBase.removeFile('base64Data');
      }
      this.imagenPreview = null;
    }
    this.lastTipo = tipo;

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  private loadFileValidations(): void {
    this.registroDocumentoService.getFileValidations().subscribe({
      next: (response) => {
        const validations = response?.data || response;

        if (validations && (validations.allowedImageExtensions || validations.allowedDocumentExtensions || validations.allowedVideoExtensions)) {
          this.maxFilesize = (validations.maxFileSize || 1) * 1024 * 1024;
          this.maxImageFilesize = (validations.maxImageSize || validations.maxFileSize || 2) * 1024 * 1024;
          this.maxVideoFilesize = (validations.maxVideoSize || validations.maxFileSize || 3) * 1024 * 1024;
          this.allowedDocumentExtensions = validations.allowedDocumentExtensions || [];
          this.allowedImageExtensions = validations.allowedImageExtensions || [];
          this.allowedVideoExtensions = validations.allowedVideoExtensions || [];
          this.validationsLoaded = true;

          this.updateFileFieldWithValidations();
        }
      },
      error: (error) => {
        console.error('Error loading file validations:', error);
        this.validationsLoaded = true;
        // Por defecto - tamaños
        this.maxFilesize = 10 * 1024 * 1024;
        this.maxImageFilesize = 15 * 1024 * 1024;
        this.maxVideoFilesize = 50 * 1024 * 1024;
      }
    });
  }

  private updateFileFieldWithValidations(): void {
    if (this.formConfig.length > 0) {
      const fileField = this.formConfig[0]?.fields.find((f: any) => f.name === 'base64Data');
      if (fileField) {
        let currentTipo = this.lastTipo;
        if (!currentTipo && this.formBase?.dynamicForm) {
          const tipoControl = this.formBase.dynamicForm.get('tipoArchivo');
          currentTipo = tipoControl?.value;
        }

        if (!currentTipo && this.fileType.length === 1) {
          currentTipo = this.fileType[0];
        }

        if (this.fileType.length === 1) {
          if (this.fileType[0] === 'IMAGEN') {
            fileField.accept = this.allowedImageExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedImageExtensions.join(',');
          } else if (this.fileType[0] === 'DOCUMENTO') {
            fileField.accept = this.allowedDocumentExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedDocumentExtensions.join(',');
          } else if (this.fileType[0] === 'VIDEO') {
            fileField.accept = this.allowedVideoExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedVideoExtensions.join(',');
          }
        } else if (currentTipo) {
          if (currentTipo === 'IMAGEN') {
            fileField.accept = this.allowedImageExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedImageExtensions.join(',');
          } else if (currentTipo === 'DOCUMENTO') {
            fileField.accept = this.allowedDocumentExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedDocumentExtensions.join(',');
          } else if (currentTipo === 'VIDEO') {
            fileField.accept = this.allowedVideoExtensions.map(ext => '.' + ext).join(',');
            fileField.allowedExtensions = this.allowedVideoExtensions.join(',');
          }
        } else {
          fileField.accept = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].map(ext => '.' + ext).join(',');
          fileField.allowedExtensions = [...this.allowedImageExtensions, ...this.allowedDocumentExtensions, ...this.allowedVideoExtensions].join(',');
        }

        fileField.maxFileSize = this.maxFilesize;
        fileField.description = this.isViewMode ? 'Vista previa de la imagen' : 'Seleccione un archivo (máx. ' + (this.maxFilesize / (1024 * 1024)) + ' MB)';

        this.cdr.detectChanges();
      }
    }
  }

  descargarArchivo() {
    if (!this.row || !this.row.archivoBase64) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se puede descargar el archivo: contenido no disponible',
        life: 3000
      });
      return;
    }

    try {
      let base64Data = this.row.archivoBase64;
      if (base64Data.startsWith('data:')) {
        const parts = base64Data.split(',');
        base64Data = parts.length > 1 ? parts[1] : base64Data;
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.row.nombreArchivo || 'archivo_descargado';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error('Error al descargar archivo:', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo descargar el archivo',
        life: 3000
      });
    }
  }

}
