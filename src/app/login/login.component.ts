import { Component, ElementRef, Inject, OnInit, AfterViewInit, ViewChild, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageManagerService } from '../shared/services/storage-manager.service';
import { LoginService } from './services/login.service';
import { Message, MessageService } from 'primeng/api';
import { DOCUMENT } from '@angular/common';
import { NotificacionService } from '../notificacion/services/notificacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  public signinForm: FormGroup;
  public forgotPasswordForm: FormGroup;
  ieUrl: string;
  uuid: string;
  showForgotPasswordModal: boolean = false;
  @ViewChild('loginVideo') loginVideo?: ElementRef<HTMLVideoElement>;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private storageManager: StorageManagerService,
    private messageService: MessageService,
    @Inject(DOCUMENT) private document: any,
    private injector: Injector
  ) { }

  ngOnInit(): void {

    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    if (this.storageManager.getCurrenSession() != null) {
      this.router.navigate(['/perfil']);
    }
  }

  ngAfterViewInit(): void {
    const video = this.loginVideo?.nativeElement;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.autoplay = true;

      const tryPlay = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
          });
        }
      };

      if (video.readyState >= 3) {
        tryPlay();
      } else {
        video.addEventListener('canplay', tryPlay, { once: true });
      }
    }
  }

  signin() {
    this.loginService.doLogin(this.signinForm.value).subscribe({
      next: (response) => {
        if (response && response.accessToken) {
          this.storageManager.saveAccessToken(response.accessToken);
          this.storageManager.saveRefreshToken(response.refreshToken);
          this.storageManager.saveSession({ usuario: response.usuario, permisos: response.permisos, organizacion: response.organizacion });
          // Reiniciar el polling de notificaciones con el nuevo usuario
          const notificacionService = this.injector.get(NotificacionService);
          notificacionService.initializePolling();
          this.router.navigate(['/perfil']);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Atención!', detail: 'Usuario o clave inválida.', life: 3000 });
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        let errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.messageService.add({ severity: 'error', summary: 'Error!', detail: errorMessage, life: 5000 });
      }
    });
  }

  signinIE() {
    this.loginService.getConfig().subscribe({
      next: (response) => {
        this.uuid = this.loginService.guid();
        this.document.location.href = response['IE'] + '&state=' + this.uuid;
      },
      error: (error) => {
        console.error("Error al obtener configuración de Identidad Electrónica:", error);
        let errorMessage = 'Error al conectar con el servicio de Identidad Electrónica. Por favor, intenta nuevamente.';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.messageService.add({ severity: 'error', summary: 'Error!', detail: errorMessage, life: 5000 });
      }
    });
  }

  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordForm.reset();
  }

  sendResetPasswordEmail() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      // Aquí puedes llamar al servicio para enviar el email de recuperación
      this.loginService.sendResetPasswordEmail(email).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito!',
            detail: 'Se ha enviado un correo de recuperación a ' + email,
            life: 5000
          });
          this.closeForgotPasswordModal();
        },
        error: (error) => {

          let errorMessage = 'Error al enviar el correo de recuperación. Por favor, intenta nuevamente.';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          this.messageService.add({ severity: 'error', summary: 'Error!', detail: errorMessage, life: 5000 });
        }
      });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Por favor ingresa un correo electrónico válido',
        life: 3000
      });
    }
  }

}
