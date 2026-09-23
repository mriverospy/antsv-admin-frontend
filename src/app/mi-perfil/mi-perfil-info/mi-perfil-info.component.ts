import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { MiPerfilInfo } from './models/mi-perfil-info.models';
import { MiPerfilService } from './services/mi-perfil-info.service';
import { CommonModule } from '@angular/common';
import { StorageManagerService } from "../../shared/services/storage-manager.service";
import { RegistroDocumentoService } from 'src/app/shared/services/registro-documento.service';

@Component({
  selector: 'app-mi-perfil-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    KeyFilterModule,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl: './mi-perfil-info.component.html',
  styleUrls: ['./mi-perfil-info.component.scss']
})
export class MiPerfilInfoComponent implements OnInit {

  profileImageUrl: string = ''; // Se cargará con las iniciales del usuario en ngOnInit
  perfil: MiPerfilInfo = {} as MiPerfilInfo;
  imagenArchivo?: File;
  isDragOver: boolean = false;
  selectedFileName: string = '';
  selectedFileSize: string = '';
  uploadProgress: number = 0;
  nombreOrganizacion: string = '';
  roles: string[] = [];
  maxImageFilesize: number = 800000;
  imageSizeLabel: string = '800KB';
  allowedImageExtensions: string[] = [];
  imageAccept: string = 'image/*';

  paises = [
    { name: 'Paraguay', value: 'paraguay' },
    { name: 'Argentina', value: 'argentina' },
    { name: 'Brasil', value: 'brasil' }
  ];
  paisSeleccionado = 'paraguay';

  constructor(
    private perfilService: MiPerfilService,
    private messageService: MessageService,
    private router: Router,
    private storageManager: StorageManagerService,
    private registroDocumentoService: RegistroDocumentoService,
  ) { }

  onImageUpload(event: any) {
    if (event.files && event.files.length > 0) {
      this.imagenArchivo = event.files[0];
      this.selectedFileName = this.imagenArchivo.name;
      this.selectedFileSize = this.formatFileSize(this.imagenArchivo.size);

      this.simulateUploadProgress();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result; // actualiza la vista
      };
      reader.readAsDataURL(this.imagenArchivo);
    }
  }

  private loadFileValidations(): void {
    this.registroDocumentoService.getFileValidations().subscribe({
      next: (response) => {
        if (response) {
          const validations = (response as any).data || response;
          this.maxImageFilesize = (validations.maxImageSize ? validations.maxImageSize * 1024 * 1024 : this.maxImageFilesize);
          const rawExt = validations.allowedImageExtensions || [];
          this.allowedImageExtensions = rawExt.map((e: string) => {
            if (!e) return e;
            let ne = e.toString().toLowerCase().trim();
            if (!ne.startsWith('.')) ne = '.' + ne;
            return ne;
          }).filter(Boolean);
          this.imageAccept = this.allowedImageExtensions.length ? this.allowedImageExtensions.join(',') : 'image/*';
          this.imageSizeLabel = this.formatFileSize(this.maxImageFilesize);
        }
      }, error: () => {
        this.imageSizeLabel = this.formatFileSize(this.maxImageFilesize);
      }
    });
  }

  private isAllowedImageExtension(fileName: string): boolean {
    if (!this.allowedImageExtensions || this.allowedImageExtensions.length === 0) return true;
    const parts = fileName.split('.');
    if (parts.length === 1) return false;
    const ext = '.' + parts.pop()!.toLowerCase();
    return this.allowedImageExtensions.includes(ext) || this.allowedImageExtensions.includes(ext.replace('.', ''));
  }

  private getAllowedExtensionsLabel(exts?: string[]): string {
    const list = exts || this.allowedImageExtensions;
    if (!list || list.length === 0) return 'image/*';
    return list.map(e => e.replace(/^\./, '').toUpperCase()).join(', ');
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: `Solo se permiten archivos de imagen. Extensiones permitidas: ${this.getAllowedExtensionsLabel()}`,
          life: 2000
        });
        return;
      }

      // Validar extensión
      if (!this.isAllowedImageExtension(file.name)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: `Tipo de archivo no permitido. Extensiones permitidas: ${this.getAllowedExtensionsLabel()}`,
          life: 3000
        });
        return;
      }

      // Validar tamaño (backend-driven)
      if (file.size > this.maxImageFilesize) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: `La imagen supera los ${this.imageSizeLabel} permitidos.`,
          life: 2000
        });
        return;
      }

      this.onImageUpload({ files: [file] });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onFileSelect({ target: { files: [files[0]] } });
    }
  }

  // Método para quitar archivo
  removeFile() {
    this.imagenArchivo = undefined;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadProgress = 0;

    // Restaurar avatar con iniciales del perfil
    const iniciales = `${this.perfil.nombre || 'U'} ${this.perfil.apellido || ''}`.trim();
    this.profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciales)}&background=cccccc&color=555555&size=150`;

    // Limpiar input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'La imagen ha sido eliminada',
      life: 2000
    });
  }

  // Simular progreso de carga
  simulateUploadProgress() {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.messageService.add({
          severity: 'success',
          summary: 'Carga exitosa',
          detail: 'La imagen ha sido cargada correctamente',
          life: 2000
        });
      }
    }, 100);
  }

  // Método helper para formatear el tamaño del archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  ngOnInit() {
    this.cargarPerfil();
    this.loadFileValidations();
  }

  cargarPerfil() {
    const currentSession = this.storageManager.getCurrenSession();
    const sessionRaw = localStorage.getItem('ngx_current_user');
    if (!sessionRaw) {
      console.warn('No se encontró sesión del usuario');
      return;
    }

    const session = JSON.parse(sessionRaw);
    const userId = session.usuario?.idUsuario;

    if (!userId) {
      console.warn('No se encontró idUsuario en la sesión');
      return;
    }

    // Cargar organización
    if (currentSession.organizacion) {
      this.nombreOrganizacion = currentSession.organizacion.nombre || '';
      //this.descripcionOrganizacion = currentSession.organizacion.descripcion || '';
    }

    // Cargar roles
    if (currentSession.usuario.roles && currentSession.usuario.roles.length > 0) {
      this.roles = currentSession.usuario.roles.map((rol: any) => rol.nombre || rol.codigo || 'Sin rol');
    }

    this.perfilService.obtenerMiPerfil(userId).subscribe({
      next: (data: MiPerfilInfo) => {
        this.perfil = data;

        // Generar avatar con iniciales (Nombre + Apellido)
        const iniciales = `${data.nombre || 'U'} ${data.apellido || ''}`.trim();
        this.profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciales)}&background=cccccc&color=555555&size=150`;

        // Si hay imagen en base64, sobrescribir el avatar
        if (data.imagenPerfilBase64) {
          this.profileImageUrl = `data:image/png;base64,${data.imagenPerfilBase64}`;
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: 'No se pudo cargar el perfil',
          life: 2000
        });
      }
    });
  }


  onSubmit() {
    // Recuperar ID del usuario desde session
    const session = localStorage.getItem('ngx_current_user');
    if (!session) return;
    const userId = JSON.parse(session).usuario.idUsuario;

    // Crear FormData
    const formData = new FormData();
    // Convertimos el objeto perfil a JSON y lo agregamos como Blob
    formData.append('perfil', new Blob([JSON.stringify(this.perfil)], { type: 'application/json' }));

    // Agregar imagen si hay
    if (this.imagenArchivo) {
      formData.append('imagenPerfil', this.imagenArchivo, this.imagenArchivo.name);
    }
    // Llamar al servicio con FormData (mas sencillo para enviar los datos)
    this.perfilService.actualizarPerfil(userId, formData).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: res.message || 'Perfil actualizado con éxito',
          life: 2000
        });
        this.imagenArchivo = undefined;


        this.perfilService.obtenerMiPerfil(userId).subscribe({
          next: (data: MiPerfilInfo) => {
            this.perfil = data;


            const iniciales = `${data.nombre || 'U'} ${data.apellido || ''}`.trim();
            this.profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciales)}&background=cccccc&color=555555&size=150`;

            // Si hay imagen en base64, sobrescribir el avatar
            if (data.imagenPerfilBase64) {
              this.profileImageUrl = `data:image/png;base64,${data.imagenPerfilBase64}`;
            }

            // Notificar a otros componentes con la imagen actualizada
            this.perfilService.actualizarImagenPerfil(this.profileImageUrl);


            this.router.navigate(['/home']);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil',
          life: 2000
        });
      }
    });
  }

  onCancel() {
    // Recargar el perfil original
    this.cargarPerfil();

    // Limpiar imagen temporal
    this.imagenArchivo = undefined;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadProgress = 0;

    // Limpiar input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
