import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StorageManagerService } from '../shared/services/storage-manager.service';
import { LoginService } from '../login/services/login.service';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.scss']
})
export class LoginCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private storageManager: StorageManagerService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['code'] && params['state']) {
        this.callback(params);
      }
    });
  }

  callback(params) {
    this.loginService
      .doLoginIE(params['code'], params['state'])
      .subscribe({
        next: (response) => {
          if(response && response.accessToken) {
            this.storageManager.saveAccessToken(response.accessToken);
            this.storageManager.saveSession({
              usuario: response.usuario,
              permisos: response.permisos,
              organizacion: response.organizacion,
            });
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          let errorMessage = 'Error desconocido';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Atención!',
            detail: errorMessage,
            life: 4500
          });
  
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        }
      });
  }

}
