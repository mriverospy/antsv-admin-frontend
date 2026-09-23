import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { Field } from '../models/shared-data.model';
import { DateUtilsService } from '../utils/date-util.service';
import { RegistroDocumentoService } from 'src/app/shared/services/registro-documento.service';


@Component({
  selector: 'app-gh-form-base-dynamic',
  templateUrl: './gh-form-base-dynamic.component.html',
  styleUrls: ['./gh-form-base-dynamic.component.scss']
})
export class FormBaseDynamic implements OnInit, OnChanges {
  @ViewChildren('fileUploader') fileUploadComponents: QueryList<FileUpload>;
  @Input() formConfig: any[];
  @Input() isViewMode: boolean = false;
  @Output() onResponse: EventEmitter<any> = new EventEmitter<any>();
  @Input() tabContent: Map<number, TemplateRef<any>>;

  dynamicForm: FormGroup;
  fields: any[] = [];
  currentDate: Date = new Date();
  tabs: any[] = [];
  isTabbed: boolean = false;
  activeTabIndex: number = 0;
  public invalidTabs: boolean[] = [];
  public hasSubmitted = false;
  uploadedFileName: { [key: string]: string[] } = {};
  uploadProgress: { [key: string]: number[] } = {};
  isFileUploaded: { [key: string]: boolean } = {};
  maxFilesize: number;
  maxImageFilesize: number;
  maxVideoFilesize: number;
  allowedMimeTypes: string[] = [];
  allowedExtensions: string[] = [];
  allowedImageExtensions: string[] = [];
  allowedVideoExtensions: string[] = [];
  allowedDocumentExtensions: string[] = [];
  fileDataMap: { [key: string]: any[] } = {};
  private editorInstances: { [key: string]: any } = {};
  imagePreviews: { [key: string]: string } = {}; // Para almacenar las vistas previas

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private dateUtils: DateUtilsService,
    private registroDocumentoService: RegistroDocumentoService
  ) {
    this.loadFileValidations();
  }

  private loadFileValidations(): void {
    this.registroDocumentoService.getFileValidations().subscribe({
      next: (response) => {
        if (response) {
          // Extraer las validaciones del response
          const validations = response.data || response;
          this.maxFilesize = (validations.maxFileSize || 12) * 1024 * 1024;
          this.maxImageFilesize = (validations.maxImageSize || 10) * 1024 * 1024;
          this.maxVideoFilesize = (validations.maxVideoSize || 50) * 1024 * 1024;
          this.allowedMimeTypes = validations.allowedMimeTypes || [];
          this.allowedExtensions = validations.allowedExtensions || [];
          this.allowedImageExtensions = validations.allowedImageExtensions || [];
          this.allowedVideoExtensions = validations.allowedVideoExtensions || [];
          this.allowedDocumentExtensions = validations.allowedDocumentExtensions || [];

          // Asignar automáticamente extensiones a campos basándose en sus nombres
          this.assignExtensionsToFields();

          // Actualizar descripciones de campos de archivo con el tamaño máximo
          this.updateFileFieldDescriptions();
        }
      },
      error: (error) => {
        console.error('Error al cargar validaciones de archivo:', error);
        this.maxFilesize = 12 * 1024 * 1024;
        this.maxImageFilesize = 10 * 1024 * 1024;
        this.maxVideoFilesize = 50 * 1024 * 1024;
        this.allowedMimeTypes = [];
        this.allowedExtensions = [];
        this.allowedImageExtensions = [];
        this.allowedVideoExtensions = [];
        this.allowedDocumentExtensions = [];
        // Actualizar descripciones incluso con el fallback
        this.updateFileFieldDescriptions();
      }
    });
  }

  // Asignar automáticamente extensiones permitidas a campos según su nombre
  private assignExtensionsToFields(): void {
    const allFields = this.isTabbed
      ? this.tabs.flatMap(tab => tab.fields)
      : this.fields;

    allFields.forEach(field => {
      if (field.type === 'file' || field.type === 'fileLazy') {
        const fieldNameLower = field.name.toLowerCase();
        
        // Asignar extensiones según el nombre del campo
        if (fieldNameLower.includes('video')) {
          field.allowedExtensions = this.allowedVideoExtensions.join(',');
          field.accept = this.allowedVideoExtensions.map(ext => '.' + ext).join(',');
        } else if (fieldNameLower.includes('imagen') || fieldNameLower.includes('image')) {
          field.allowedExtensions = this.allowedImageExtensions.join(',');
          field.accept = this.allowedImageExtensions.map(ext => '.' + ext).join(',');
        } else if (fieldNameLower.includes('documento') || fieldNameLower.includes('document')) {
          field.allowedExtensions = this.allowedDocumentExtensions.join(',');
          field.accept = this.allowedDocumentExtensions.map(ext => '.' + ext).join(',');
        }
        // Si el campo ya tiene allowedExtensions definidas manualmente, no las sobrescribir
      }
    });
  }

  // Recorre los campos y actualiza las descripciones de los campos de archivo
  private updateFileFieldDescriptions(): void {
    const allFields = this.isTabbed
      ? this.tabs.flatMap(tab => tab.fields)
      : this.fields;

    allFields.forEach(field => {
      if ((field.type === 'file' || field.type === 'fileLazy') && field.description) {
        // Si la descripción no menciona el tamaño, agregamos dinamicamente
        if (!field.description.includes('máx.') && !field.description.includes('max.')) {
          const descLower = field.description.toLowerCase();
          // Verificar si el archivo es imagen o video para asignar el tamaño correcto
          if (descLower.includes('video')) {
            const maxVideoSizeMB = Math.round(this.maxVideoFilesize / (1024 * 1024));
            field.description = `${field.description} (máx. ${maxVideoSizeMB}MB)`;
          } else if (descLower.includes('imagen') || descLower.includes('image')) {
            const maxImageSizeMB = Math.round(this.maxImageFilesize / (1024 * 1024));
            field.description = `${field.description} (máx. ${maxImageSizeMB}MB)`;
          }
          else {
            // Tamaño general para otros tipos de archivo
            field.description = `${field.description} (máx. ${Math.round(this.maxFilesize / (1024 * 1024))}MB)`;
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.uploadedFileName = {};
    this.uploadProgress = {};
    this.isFileUploaded = {};
    this.fileDataMap = {};
    this.initForm();
    this.updateFormControlsDisabledState();

    this.fields.forEach(field => {
      if (field.conditional) {
        const dependency = field.conditional.field;
        const control = this.dynamicForm.get(dependency);

        if (control) {
          control.valueChanges.subscribe(value => {
            const shouldShow = value === field.conditional.value;
            const targetControl = this.dynamicForm.get(field.name);

            if (shouldShow) {
              targetControl?.enable();
            } else {
              targetControl?.disable();
              targetControl?.reset();
            }

            if (field.hasOwnProperty('hidden')) {
              field.hidden = !shouldShow;
            }
          });
        }

        if (!field.hasOwnProperty('hidden')) {
          field.hidden = false;
        }
        field.hidden = true;
        this.dynamicForm.get(field.name)?.disable();
      }
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && changes['formConfig'].currentValue && changes['formConfig'].currentValue.length > 0) {
      // Si formConfig cambia y tiene contenido, reinicializar el formulario
      if (this.dynamicForm) {
        this.initForm();
        this.updateFormControlsDisabledState();
      }
    }
    if (changes['isViewMode'] && !changes['isViewMode'].firstChange && this.dynamicForm) {
      this.updateFormControlsDisabledState();
    }
  }

  private updateFormControlsDisabledState(): void {
    if (!this.dynamicForm) return;

    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      const field = this.findField(key) as any;

      if (control && field) {
        const fieldDisabled = field.disabled === true;
        const shouldBeDisabled = fieldDisabled || this.isViewMode;

        if (shouldBeDisabled && control.enabled) {
          control.disable({ emitEvent: false });
        } else if (!shouldBeDisabled && control.disabled && !fieldDisabled) {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  initForm() {
    this.dynamicForm = this.formBuilder.group({});
    this.isTabbed = this.formConfig.length > 1;

    this.tabs = [];
    this.fields = [];

    const addedFields = new Set();

    if (this.isTabbed) {
      this.tabs = [...this.formConfig];

      this.tabs.forEach(tab => {
        tab.fields.forEach(field => {
          if (!['button', 'submit'].includes(field.type) && !addedFields.has(field.name)) {
            this.addField(field);
            addedFields.add(field.name);
          }
        });
      });
    } else {
      this.fields = [...this.formConfig.flatMap(tab => tab.fields)];

      this.fields.forEach(field => {
        if (!['button', 'submit'].includes(field.type) && !addedFields.has(field.name)) {
          this.addField(field);
          addedFields.add(field.name);
        }
      });
    }
  }


  public updateFormValues(values: any) {
    if (!values) return;
    this.activeTabIndex = 0;
    Object.keys(values).forEach(key => {
      const control = this.dynamicForm.get(key);

      // Procesar si tenemos control y no es 'fotos'
      if (control && key !== 'fotos') {
        const field = this.findField(key);

        if (field && field.type === 'editor') {
          // SIEMPRE guardar el valor pendiente
          this.editorInstances[`${key}_pending_value`] = values[key];
          // Establecer en el FormControl
          try {
            control.setValue(values[key], { emitEvent: false });
            control.markAsDirty();
          } catch (error) {
            console.error(`Error estableciendo valor en FormControl ${key}:`, error);
          }

          // Si el editor ya está inicializado, cargar inmediatamente
          if (this.editorInstances[`${key}_initialized`] && this.editorInstances[key]) {
            this.setQuillContent(key, values[key]);
            // Limpiar valor pendiente después de usar
            delete this.editorInstances[`${key}_pending_value`];
          }
        } else {
          try {
            control.setValue(values[key]);
          } catch (error) {

          }
        }
      }
    });

  }

  // Método para obtener valores pendientes (para debugging)
  private getPendingValues(): any {
    const pendingValues = {};
    Object.keys(this.editorInstances).forEach(key => {
      if (key.includes('_pending_value')) {
        const fieldName = key.replace('_pending_value', '');
        pendingValues[fieldName] = this.editorInstances[key];
      }
    });
    return pendingValues;
  }

  private setEditorValue(control: any, value: string, fieldName?: string) {
    // Establecer en el FormControl
    control.setValue(value);
    control.markAsDirty();
    control.updateValueAndValidity();

    // Si tenemos el nombre del campo y la instancia de Quill, usarla
    if (fieldName && this.editorInstances[fieldName]) {
      this.setQuillContent(fieldName, value);
    }
  }

  private setEditorValueWithRetry(fieldName: string, value: string, maxAttempts: number = 15): void {
    let attempts = 0;

    const trySetValue = () => {
      attempts++;
      if (this.editorInstances[fieldName]) {
        this.setQuillContent(fieldName, value);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(trySetValue, 300);
      } else {
        console.error(`No se pudo establecer el contenido del editor ${fieldName} después de ${maxAttempts} intentos`);

        // Como último recurso, intentar establecer solo en el FormControl
        const control = this.dynamicForm.get(fieldName);
        if (control) {
          control.setValue(value);
          control.markAsDirty();
        }
      }
    };

    // Empezar inmediatamente, luego con delay
    if (this.editorInstances[fieldName]) {
      this.setQuillContent(fieldName, value);
    } else {
      setTimeout(trySetValue, 100);
    }
  }

  public initializeExistingFiles(fieldName: string, fileIds: string[], fileNames: string[]) {
    if (!fileIds || fileIds.length === 0) return;

    if (!this.fileDataMap) this.fileDataMap = {};
    if (!this.uploadedFileName) this.uploadedFileName = {};
    if (!this.uploadProgress) this.uploadProgress = {};
    if (!this.isFileUploaded) this.isFileUploaded = {};

    this.fileDataMap[fieldName] = [...fileIds];
    this.uploadedFileName[fieldName] = fileNames || fileIds.map((_, i) => `File_${i + 1}`);
    this.uploadProgress[fieldName] = fileIds.map(() => 100);
    this.isFileUploaded[fieldName] = true;

    const control = this.dynamicForm.get(fieldName);
    if (control) {
      const field = this.findField(fieldName);
      if (field?.multiple) {
        control.setValue([...fileIds]);
      } else if (fileIds.length > 0) {
        control.setValue(fileIds[0]);
      }
    }
  }

  public updateFieldOptions(fieldName: string, newOptions: any[]) {
    if (this.isTabbed) {
      this.tabs.forEach(tab => {
        const field = tab.fields.find(f => f.name === fieldName);
        if (field) {
          field.options = newOptions;
        }
      });
    } else {
      const field = this.fields.find(f => f.name === fieldName);
      if (field) {
        field.options = newOptions;
      }
    }

    const control = this.dynamicForm.get(fieldName);
    if (control && control.value) {
      const currentValue = control.value;

      if (typeof currentValue === 'object' && currentValue && currentValue.id) {
        const valueExists = newOptions.some(opt =>
          (opt.value && opt.value.id === currentValue.id) ||
          (typeof opt === 'object' && opt.id === currentValue.id)
        );

        if (!valueExists) {
          control.setValue(null);
        }
      }
    }
  }

  addField(field: any) {
    if (!this.dynamicForm.contains(field.name)) {
      const validators = [];
      if (field.validations) validators.push(...field.validations);
      if (field.required && (field.visible === undefined || field.visible === true)) validators.push(Validators.required);

      // Crear el control con el estado disabled si es necesario
      const controlState = { value: field.initValue ?? null, disabled: field.disabled || this.isViewMode };
      const control = this.formBuilder.control(controlState, validators);

      this.dynamicForm.addControl(field.name, control);

      // Configurar el listener de cambios para llamar al callback si existe
      if (field.callback) {
        const control = this.dynamicForm.get(field.name);
        if (control) {
          control.valueChanges.subscribe(value => {
            field.callback(value);
          });
        }
      }
    }
  }

  prevTab() {
    if (this.activeTabIndex > 0) this.activeTabIndex--;
  }

  nextTab() {
    const currentTabFields = this.tabs[this.activeTabIndex].fields;
    let hasErrors = false;
    const invalidFields = [];

    // Verifica cada campo del tab actual
    currentTabFields.forEach(field => {
      // Solo revisamos campos de entrada, no botones ni acciones
      if (!['button', 'submit'].includes(field.type)) {
        const control = this.dynamicForm.get(field.name);
        if (control) {
          control.markAsTouched();
          control.updateValueAndValidity();

          // Si el control es inválido, guardamos información sobre el error
          if (control.invalid) {
            hasErrors = true;

            // Obtener los tipos de errores
            const errorTypes = Object.keys(control.errors || {}).join(', ');

            // Guardar información detallada del campo con error
            invalidFields.push({
              name: field.name,
              label: field.label,
              errors: errorTypes,
              value: control.value
            });
          }
        }
      }
    });

    // Mostrar los campos con error en la consola
    if (hasErrors) {
      if (!this.isLastTab) {
        this.messageService.add({
          severity: 'warn',
          detail: 'Los datos del formulario son requeridos. ¡Favor verificar!',
          life: 5000
        });
      }

      return;
    }

    // Si no hay errores, avanzamos al siguiente tab
    this.activeTabIndex++;
  }

  getFieldErrorMessage(field: Field): string {
    const control = this.dynamicForm.get(field.name);
    if (!control) return '';

    if (control.errors) {
      const errors = control.errors;

      if (errors.required) {
        return `${field.label} es requerido.`;
      }
      else if (errors.dateInFuture) {
        return `${field.label} no puede ser mayor a la fecha actual.`;
      }
      else if (errors.pattern) {
        // Personalizar mensaje para el error de patrón según el campo
        if (field.validationMessage) {
          return field.validationMessage;
        } else {
          return `${field.label} tiene un formato inválido.`;
        }
      }
      else if (errors.maxlength) {
        //incluir campos que necesitan ser tratados como 'números'
        if (field.validationMessage) {
          return field.validationMessage;
        } else {
          const unidades = ['telefono'].includes(field.name.toLowerCase()) ? 'dígitos' : 'caracteres';
          return `${field.label} no puede exceder ${errors.maxlength.requiredLength} ${unidades}.`;
        }

      }
      else if (errors.minlength) {
        const minLength = errors.minlength.requiredLength;
        return `${field.label} debe tener al menos ${minLength} caracteres.`;
      }
      else if (errors.email) {
        return `${field.label} debe ser un correo electrónico válido.`;
      }
    }

    return '';
  }

  procesar() {
    this.hasSubmitted = true;
    this.markFormGroupTouched();
    this.validateTabs();

    if (this.dynamicForm.valid) {
      const formValues = this.dynamicForm.getRawValue();
      const processedValues: any = {};

      Object.keys(formValues).forEach(key => {
        const field = this.isTabbed
          ? this.tabs.flatMap(tab => tab.fields).find(f => f.name === key)
          : this.fields.find(f => f.name === key);

        if (!field) {
          processedValues[key] = formValues[key];
        } else if (['dropdown', 'selectButton', 'radioGroup'].includes(field.type)) {
          processedValues[key] = formValues[key]?.value || formValues[key];
        } else if (field.type === 'date' && formValues[key]) {
          processedValues[key] = formValues[key];
        } else {
          processedValues[key] = formValues[key];
        }
      });
      this.onResponse.emit(processedValues);
    } else {
      this.messageService.add({
        severity: 'warn',
        detail: 'Los datos del formulario son requeridos. ¡Favor verificar!',
        life: 5000
      });
    }
  }

  private validateTabs() {
    this.invalidTabs = [];
    if (this.isTabbed) {
      this.tabs.forEach((tab, index) => {
        const hasError = tab.fields.some(field => {
          const control = this.dynamicForm.get(field.name);
          return control?.invalid && (control?.touched || this.hasSubmitted);
        });
        this.invalidTabs[index] = hasError;
      });
    }
  }

  get isLastTab(): boolean {
    return this.activeTabIndex === this.tabs.length - 1;
  }

  private markFormGroupTouched() {
    Object.values(this.dynamicForm.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      }
    });
    this.validateTabs();
  }

  resetForm() {
    this.dynamicForm.reset();
    this.resetValidationState();

    Object.keys(this.editorInstances).forEach(key => {
      if (key.includes('_pending_value') || key.includes('_initialized') || key.includes('_content_set')) {
        delete this.editorInstances[key];
      } else {
        const quillInstance = this.editorInstances[key];
        if (quillInstance && quillInstance.setText) {
          try {
            quillInstance.setText('');
          } catch (error) {
          }
        }
      }
    });

    Object.keys(this.dynamicForm.controls).forEach(key => {
      this.dynamicForm.get(key).markAsUntouched();
    });

    this.uploadedFileName = {};
    this.uploadProgress = {};
    this.isFileUploaded = {};
    this.fileDataMap = {};

    setTimeout(() => {
      this.fileUploadComponents?.forEach((fileCmp) => {
        fileCmp.clear();
      });
    }, 100);
  }


  public resetValidationState() {
    this.hasSubmitted = false;
    this.invalidTabs = [];
    this.activeTabIndex = 0;
  }

  getFieldStyle(field: any, defaultStyle: any = null): any {
    // Si field.style existe y es un objeto válido (no array, no string), devolverlo
    if (field && field.style) {
      // Si es un string, ignorarlo completamente
      if (typeof field.style === 'string') {
        return defaultStyle;
      }
      // Si es un objeto válido (no array), devolverlo
      if (typeof field.style === 'object' && !Array.isArray(field.style) && field.style !== null) {
        return field.style;
      }
    }
    // Devolver el defaultStyle (puede ser null o un objeto)
    return defaultStyle;
  }

  getFieldStyleWithDefault(field: any): any {
    const defaultStyle = { 'minWidth': '100%', 'width': '100%' };

    // Validar que field existe
    if (!field) {
      return defaultStyle;
    }

    // Si field.style es un string, ignorarlo completamente
    if (field.style && typeof field.style === 'string') {
      return defaultStyle;
    }

    // Si field.style es un objeto válido, usarlo
    if (field.style && typeof field.style === 'object' && !Array.isArray(field.style) && field.style !== null) {
      return field.style;
    }

    // Devolver el defaultStyle
    return defaultStyle;
  }

  customUploadHandler(event: any, fieldName: string, fileUploader: FileUpload) {
    const field = this.findField(fieldName);
    const isMultiple = field?.multiple || false;

    const files = Array.isArray(event.files) ? event.files : [event.files[0]];

    if (!this.uploadedFileName[fieldName]) {
      this.uploadedFileName[fieldName] = [];
      this.uploadProgress[fieldName] = [];
    }

    for (const file of files) {
      if (!file) continue;

      // Validar extensión específica del campo si está definida
      if (field?.allowedExtensions) {
        const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        const allowedExts = field.allowedExtensions.split(',').map((ext: string) => ext.trim().toLowerCase());
        if (!allowedExts.includes(fileExtension)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Formato no permitido. Tipos permitidos: ' + field.allowedExtensions
          });
          setTimeout(() => fileUploader.clear(), 100);
          continue;
        }
      }

      // Validar MIME type específico del campo si está definido
      if (field?.allowedMimeTypes) {
        const allowedMimes = field.allowedMimeTypes.split(',').map((mime: string) => mime.trim());
        if (!allowedMimes.includes(file.type)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Formato no permitido. Tipos permitidos: ' + field.allowedExtensions
          });
          setTimeout(() => fileUploader.clear(), 100);
          continue;
        }
      } else if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Formato no permitido. Tipos permitidos: ' + this.allowedExtensions.join(', ')
        });
        setTimeout(() => fileUploader.clear(), 100);
        continue;
      }

      // Validar el tamano del archivo según el contexto del campo (no del tipo de archivo)
      const fieldNameLower = fieldName.toLowerCase();
      const isVideoField = fieldNameLower.includes('video');
      const isImageField = fieldNameLower.includes('imagen') || fieldNameLower.includes('image');
      
      console.log('Campo:', fieldName, '| Tipo archivo:', file.type, '| Tamaño:', file.size);
      
      let maxSizeToUse: number;
      let fileTypeLabel: string;
      
      if (isVideoField) {
        // Campo de video - usar límite de video
        maxSizeToUse = this.maxVideoFilesize;
        fileTypeLabel = 'video';
      } else if (isImageField) {
        // Campo de imagen - usar límite de imagen
        maxSizeToUse = this.maxImageFilesize;
        fileTypeLabel = 'imagen';
      } else {
        // Otros campos - usar límite general o específico del campo
        maxSizeToUse = field?.maxFileSize || this.maxFilesize;
        fileTypeLabel = 'archivo';
      }
      
      if (file.size > maxSizeToUse) {
        const maxSizeMB = Math.round(maxSizeToUse / (1024 * 1024));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `El archivo supera los ${maxSizeMB}MB permitidos`
        });
        setTimeout(() => fileUploader.clear(), 100);
        continue;
      }

      const fileIndex = this.uploadedFileName[fieldName].length;
      this.uploadedFileName[fieldName].push(file.name);
      this.uploadProgress[fieldName][fileIndex] = 0;

      const interval = setInterval(() => {
        this.uploadProgress[fieldName][fileIndex] += 10;
        if (this.uploadProgress[fieldName][fileIndex] >= 100) {
          clearInterval(interval);

          this.convertToBase64(file, fieldName, isMultiple);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Archivo adjuntado correctamente'
          });

          setTimeout(() => fileUploader.clear(), 100);

          if (!isMultiple) {
            this.isFileUploaded[fieldName] = true;
          }
        }
      }, 100);
    }
  }



  convertToBase64(file: File, fieldName: string, isMultiple: boolean = false) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const base64Data = base64WithPrefix.split(',')[1];
      const fileString = `${file.name},${base64Data}`;

      if (!this.fileDataMap[fieldName]) {
        this.fileDataMap[fieldName] = [];
      }

      // Si es una imagen o video, guardar la vista previa
      if (this.isImageFile(file) || file.type.startsWith('video/')) {
        this.imagePreviews[fieldName] = base64WithPrefix;
      }

      if (isMultiple) {
        this.fileDataMap[fieldName].push(fileString);

        this.dynamicForm.patchValue({
          [fieldName]: [...this.fileDataMap[fieldName]]
        });
      } else {
        this.fileDataMap[fieldName] = [fileString];

        this.dynamicForm.patchValue({
          [fieldName]: fileString
        });
      }
    };
  }

  public removeFile(
    fieldName: string,
    fileIndex?: number,
    fileUploader?: FileUpload
  ) {
    const field = this.findField(fieldName);

    if (!this.fileDataMap[fieldName]) {
      this.fileDataMap[fieldName] = [];
    }

    if (!this.uploadedFileName[fieldName]) {
      this.uploadedFileName[fieldName] = [];
    }

    if (!this.uploadProgress[fieldName]) {
      this.uploadProgress[fieldName] = [];
    }

    if (field?.multiple && typeof fileIndex === 'number') {

      this.uploadedFileName[fieldName].splice(fileIndex, 1);
      this.uploadProgress[fieldName].splice(fileIndex, 1);

      if (this.fileDataMap[fieldName]) {
        this.fileDataMap[fieldName].splice(fileIndex, 1);
      }
      this.dynamicForm.patchValue({ [fieldName]: [...this.fileDataMap[fieldName]] });
    }
    else {
      this.uploadedFileName[fieldName] = [];
      this.uploadProgress[fieldName] = [];
      this.fileDataMap[fieldName] = [];

      this.dynamicForm.patchValue({ [fieldName]: null });
      this.isFileUploaded[fieldName] = false;

      // Limpiar vista previa al eliminar archivo
      this.clearImagePreview(fieldName);

      //Validación al eliminar archivo
      const control = this.dynamicForm.get(fieldName);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    }

    if (fileUploader) {
      setTimeout(() => {
        fileUploader.clear();
      }, 100);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Archivo removido'
    });
  }


  private findField(fieldName: string): Field {
    if (this.isTabbed) {
      for (const tab of this.tabs) {
        const field = tab.fields.find(f => f.name === fieldName);
        if (field) {
          return field;
        }
      }

    } else {
      const field = this.fields.find(f => f.name === fieldName);
      if (field) {
        return field;
      }
    }
    return null;
  }

  updateFieldValidators(field: any) {
    const control = this.dynamicForm.get(field.name);
    if (!control) return;

    // Si el campo no es visible y es requerido, quitar validadores
    if (field.visible === false) {
      control.clearValidators();
      control.updateValueAndValidity();
    } else if (field.required) {
      // Si es visible y requerido, asegurar que tenga validadores
      const validators = [];
      if (field.validations) validators.push(...field.validations);
      validators.push(Validators.required);
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }


  downloadFile(fieldName: string, index: number = 0) {
    // 1. Buscar el ID del archivo
    let fileId = null;

    // Obtener el valor del control
    const fieldValue = this.dynamicForm.get(fieldName)?.value;

    if (Array.isArray(fieldValue)) {
      // Si es un array, obtener el archivo en el índice específico
      fileId = fieldValue[index];
    } else {
      // Si no es un array, usar el valor directamente
      fileId = fieldValue;
    }

    // Validar que el ID sea válido (debería ser un ObjectId de MongoDB)
    if (!fileId || typeof fileId !== 'string' || fileId.includes(',')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró el archivo para descargar o el archivo no ha sido guardado aún'
      });
      return;
    }

    // 2. Determinar el nombre del archivo
    let fileName = this.uploadedFileName[fieldName]?.[index] || 'archivo_descargado';

    // 3. Descargar el archivo
    this.registroDocumentoService.downloadFile(fileId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Archivo descargado correctamente'
        });
      },
      (error) => {
        console.error('Error al descargar el archivo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar el archivo'
        });
      }
    );
  }

  onEditorInit(event: any, fieldName: string) {
    // Obtener la instancia de Quill
    let quillInstance = event?.editor || event?.quill || event;

    if (quillInstance) {

      this.editorInstances[fieldName] = quillInstance;

      // Marcar como inicializado
      this.editorInstances[`${fieldName}_initialized`] = true;

      // Buscar contenido en diferentes fuentes
      const control = this.dynamicForm.get(fieldName);
      const pendingValue = this.editorInstances[`${fieldName}_pending_value`];
      const currentValue = control?.value;

      // Priorizar valor pendiente sobre valor del FormControl
      let valueToLoad = null;
      if (pendingValue && pendingValue.trim()) {
        valueToLoad = pendingValue;
        // Limpiar valor pendiente después de usarlo
        delete this.editorInstances[`${fieldName}_pending_value`];
      } else if (currentValue && currentValue.trim()) {
        valueToLoad = currentValue;
      }


      // Configurar modo después de cargar contenido
      if (this.isViewMode) {

        quillInstance.disable();
      } else {
        quillInstance.enable();
      }

    }
  }

  private setQuillContent(fieldName: string, content: string) {
    const quillInstance = this.editorInstances[fieldName];
    if (quillInstance && content) {
      try {
        quillInstance.root.innerHTML = content;
      } catch (error) {
      }
    }
  }

  // Método público para establecer contenido manualmente
  public setEditorContent(fieldName: string, content: string) {
    // Actualizar FormControl
    const control = this.dynamicForm.get(fieldName);
    if (control) {
      control.setValue(content, { emitEvent: false });
      control.markAsDirty();
    }

    // Actualizar editor
    this.setQuillContent(fieldName, content);
  }

  // Método específico para forzar la carga en modo vista
  public forceLoadViewContent() {
    Object.keys(this.editorInstances).forEach(fieldName => {
      if (!fieldName.includes('_initialized') && !fieldName.includes('_content_set')) {
        const control = this.dynamicForm.get(fieldName);
        const quillInstance = this.editorInstances[fieldName];

        if (control && control.value && quillInstance) {
          try {
            quillInstance.root.innerHTML = control.value;
            quillInstance.disable(); // Asegurar que esté deshabilitado en modo vista
          } catch (error) {
            console.error(`Error contenido en ${fieldName}:`, error);
          }
        }
      }
    });
  }

  onEditorTextChange(event: any, fieldName: string) {
    if (!this.isViewMode) {
      const control = this.dynamicForm.get(fieldName);
      if (control) {
        const newValue = event.htmlValue || event.textValue || '';
        // Actualizar el FormControl sin disparar eventos
        control.setValue(newValue, { emitEvent: false });
        control.markAsDirty();
      }
    }
  }

  public forceEditorSync(fieldName: string) {
    const control = this.dynamicForm.get(fieldName);
    const quillInstance = this.editorInstances[fieldName];

    if (control && quillInstance) {
      const controlValue = control.value;
      const editorValue = quillInstance.root.innerHTML;

      // Si hay diferencias, actualizar el editor
      if (controlValue && controlValue !== editorValue) {
        try {
          quillInstance.setText('');
          quillInstance.clipboard.dangerouslyPasteHTML(controlValue);
        } catch (error) {
          console.error('Error sincronizando editor:', error);
        }
      }
    }
  }

  // Método público para debugging
  public debugEditor(fieldName: string) {
    const quillInstance = this.editorInstances[fieldName];
  }

  // Método para debugging completo del estado
  public debugFormState() {
    Object.keys(this.editorInstances).forEach(key => {
    });
  }

  // Método para inicializar correctamente el editor después de que se muestra el diálogo
  public initializeEditorAfterDialogShow() {

    // Esperar un momento para que el DOM se actualice
    setTimeout(() => {
      Object.keys(this.editorInstances).forEach(fieldName => {
        if (!fieldName.includes('_initialized') && !fieldName.includes('_content_set')) {
          const control = this.dynamicForm.get(fieldName);
          const quillInstance = this.editorInstances[fieldName];

          if (control && quillInstance) {
            const value = control.value;

            // Configurar según el modo
            if (this.isViewMode) {
              quillInstance.disable();
            } else {
              quillInstance.enable();
            }
          }
        }
      });
    }, 500); // Aumentar el timeout para dar más tiempo
  }

  // Método mejorado para inicializar editores con valores pendientes
  public initializeEditorAfterDialogShowImproved() {
    Object.keys(this.editorInstances).forEach(key => {
      if (key.includes('_pending_value')) {
        const fieldName = key.replace('_pending_value', '');
        const pendingValue = this.editorInstances[key];
        const quillInstance = this.editorInstances[fieldName];

        if (quillInstance && quillInstance.clipboard) {
          quillInstance.setText('');
          quillInstance.clipboard.dangerouslyPasteHTML(pendingValue);
          delete this.editorInstances[key];
        }
      }
    });

    Object.keys(this.editorInstances).forEach(key => {
      if (!key.includes('_initialized') && !key.includes('_content_set') && !key.includes('_pending_value')) {
        const control = this.dynamicForm.get(key);
        const quillInstance = this.editorInstances[key];

        if (control && quillInstance && quillInstance.clipboard) {
          const value = control.value;
          if (value) {
            quillInstance.setText('');
            quillInstance.clipboard.dangerouslyPasteHTML(value);
          }
        }
      }
    });
  }

  // Método para verificar si un archivo es una imagen
  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Metodo que permite pasarle un base64 para mostrar la foto en el visor
  setImagePreview(fieldName: string, base64: string) {
    this.imagePreviews[fieldName] = base64;
  }

  // Método para obtener la vista previa de una imagen (versión original)
  getImagePreview(fieldName: string): string | null {
    return this.imagePreviews[fieldName] || null;
  }

  // Método lazy loading para obtener vista previa de archivo (imagen o video)
  // Detecta automáticamente si es Base64 (vista previa local) o un ID de MongoDB (archivo del backend)
  getFileLazyPreview(fieldName: string): string | null {
    // Primero buscar en imagePreviews (para vistas previas locales)
    let fileData = this.imagePreviews[fieldName];

    // Si no hay en imagePreviews, buscar en el FormControl
    if (!fileData) {
      const control = this.dynamicForm.get(fieldName);
      if (control && control.value) {
        fileData = control.value;
      }
    }

    if (!fileData) {
      return null;
    }

    // Si es Base64 (empieza con 'data:image' o 'data:video'), retornar como está
    if (fileData.startsWith('data:image') || fileData.startsWith('data:video')) {
      return fileData;
    }

    // Si parece un ObjectId de MongoDB (24 caracteres hexadecimales), construir URL del endpoint
    const isObjectId = /^[a-f0-9]{24}$/i.test(fileData);
    if (isObjectId) {
      return `/api/archivo/imagen/${fileData}`;
    }

    // Si es cualquier otro formato, retornar como está (por compatibilidad)
    return fileData;
  }

  // Método para verificar si es un video
  isVideoFile(fieldName: string): boolean {
    // Si el campo se llama 'video', siempre es un video cuando tiene valor
    if (fieldName === 'video') {
      const control = this.dynamicForm.get(fieldName);
      return control && control.value && control.value.trim() !== '';
    }

    const preview = this.getFileLazyPreview(fieldName);
    if (!preview) return false;

    // Verificar si el preview es un video
    if (preview.startsWith('data:video/')) {
      return true;
    }

    // Si es una URL del backend, verificamos si el FormControl tiene información sobre el tipo
    const control = this.dynamicForm.get(fieldName);
    if (control && control.value) {
      const value = control.value;
      // Si el valor contiene el nombre de un archivo de video
      if (typeof value === 'string' && value.includes(',')) {
        const nombreArchivo = value.split(',')[0].toLowerCase();
        if (nombreArchivo.endsWith('.mp4') ||
          nombreArchivo.endsWith('.mov') ||
          nombreArchivo.endsWith('.avi') ||
          nombreArchivo.endsWith('.webm') ||
          nombreArchivo.endsWith('.mkv')) {
          return true;
        }
      }
    }
    return false;
  }

  // Método para obtener el tipo de archivo (necesario para determinar si mostrar video o imagen)
  getFileType(fieldName: string): 'image' | 'video' | null {
    // Si el campo se llama 'video', siempre es video
    if (fieldName === 'video') {
      const control = this.dynamicForm.get(fieldName);
      return (control && control.value && control.value.trim() !== '') ? 'video' : null;
    }

    const preview = this.getFileLazyPreview(fieldName);
    if (!preview) return null;
    if (preview.startsWith('data:video/')) return 'video';
    if (preview.startsWith('data:image/')) return 'image';
    // Si es una URL del backend, asumimos que puede ser video o imagen
    // Necesitamos verificar el tipo desde el backend, por ahora retornamos null
    return null;
  }

  // Método para limpiar vista previa al remover archivo
  private clearImagePreview(fieldName: string): void {
    delete this.imagePreviews[fieldName];
  }

}
