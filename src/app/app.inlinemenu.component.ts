import { Component, Input } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { AppMainComponent } from './app.main.component';
import { AppComponent } from './app.component';
import { MessageResponse } from 'src/app/shared/models/message-response.model';

import { LoginService } from './login/services/login.service';
import { Router } from '@angular/router';
import { StorageManagerService } from './shared/services/storage-manager.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-inline-menu',
    templateUrl: './app.inlinemenu.component.html',
    animations: [
        trigger('menu', [
            state('hiddenAnimated', style({
                height: '0px',
                paddingBottom: '0px',
                overflow: 'hidden'
            })),
            state('visibleAnimated', style({
                height: '*',
                overflow: 'visible'
            })),
            state('visible', style({
                opacity: 1,
                'z-index': 100
            })),
            state('hidden', style({
                opacity: 0,
                'z-index': '*'
            })),
            transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('visible => hidden', animate('.1s linear')),
            transition('hidden => visible', [style({transform: 'scaleY(0.8)'}), animate('.12s cubic-bezier(0, 0, 0.2, 1)')])
        ])
    ]
})
export class AppInlineMenuComponent {

    @Input() key = 'inline-menu';

    @Input() style: any;

    @Input() styleClass: string;

    active: boolean;
    name: string;
    username: string;

    public showDialog: boolean;

    constructor(
        public appMain: AppMainComponent, 
        public app: AppComponent,
        private loginService: LoginService,
        private router: Router,
        private storageManager: StorageManagerService,
        private messageService: MessageService,) { }
    
    ngOnInit(): void {
        this.name = this.storageManager.getCurrenSession().usuario.nombre + ' ' + this.storageManager.getCurrenSession().usuario.apellido;
        this.username = this.storageManager.getCurrenSession().usuario.username;
    }

    onClick(event) {
        this.appMain.onInlineMenuClick(event, this.key);
        event.preventDefault();
    }

    get isTooltipDisabled() {
        return !(this.appMain.isSlim() && !this.appMain.isMobile());
    }

    get tabIndex() {
        return !this.appMain.inlineMenuActive  ? '-1' : null;
    }

    isHorizontalActive() {
       return this.appMain.isHorizontal() && !this.appMain.isMobile();
    }

    logout(event: any) {
        // Llamar al método centralizado de logout (maneja todo automáticamente)
        this.loginService.logout();
    }

    openChangePass() {
        this.showDialog = true;
    }

    changeDialogVisibility($event) {
        this.showDialog = $event;
    }
    
    onResponse(res: MessageResponse) {
        if (res.code == 200) {
            this.messageService.add({severity: 'success', summary: 'Operación exitosa', detail: 'Operación exitosa', life: 3000});
            
        } else {
            if (res.code < 500) {
                this.messageService.add({severity: 'warn', summary: 'Atención', detail: res.message, life: 30000});
            } else {
                this.messageService.add({severity: 'error', summary: 'Atención', detail: 'Error al procesar la operación', life: 30000});
            }
        }
    }
}
