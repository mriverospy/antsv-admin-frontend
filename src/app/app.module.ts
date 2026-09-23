import { PickListModule } from 'primeng/picklist';
import { NotificacionComponent } from './notificacion/notificacion.component';
import { TipoDocumentoFormComponent } from './tipo-documento/tipo-documento-form/tipo-documento-form.component';
import { TipoDocumentoListComponent } from './tipo-documento/tipo-documento-list/tipo-documento-list.component';
import { ArchivoFormComponent } from './shared/archivos/archivos-form/archivo-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { EditorModule } from 'primeng/editor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastModule } from 'primeng/toast';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { LoginComponent } from './login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppInlineMenuComponent } from './app.inlinemenu.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { TooltipModule } from 'primeng/tooltip';
import { AppTopBarComponent } from './app.topbar.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { UsuarioPassComponent } from './usuario/usuario-pass/usuario-pass.component';
import { DialogModule } from 'primeng/dialog';
import { AppMainComponent } from './app.main.component';
import { AppConfigComponent } from './app.config.component';
import { AppRightMenuComponent } from './app.rightmenu.component';
import { AppFooterComponent } from './app.footer.component';
import { SidebarModule } from 'primeng/sidebar';
import { AuthorizationHeaderInterceptorService } from './shared/services/authorization-header-interceptor.service';
import { ResponseInterceptorService } from './shared/services/response-interceptor.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MenuService } from './app.menu.service';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { CookiesStorageService, LocalStorageService } from 'ngx-store';
import { PermissionGuardService } from './shared/services/permission-guard.service';
import { LoginService } from './login/services/login.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PermisoListComponent } from './permiso/permiso-list/permiso-list.component';
import { PermisoFormComponent } from './permiso/permiso-form/permiso-form.component';
import { TableModule } from 'primeng/table';
import { AuditoriaListComponent } from './auditoria/auditoria-list/auditoria-list.component';
import { UsuarioListComponent } from './usuario/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './usuario/usuario-form/usuario-form.component';
import { RolListComponent } from './rol/rol-list/rol-list.component';
import { RolFormComponent } from './rol/rol-form/rol-form.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RippleModule } from 'primeng/ripple';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PasswordModule } from 'primeng/password';
import { PaginatorModule } from 'primeng/paginator';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RolPermisoComponent } from './rol/rol-permiso/rol-permiso.component';
import { PanelMenuModule } from 'primeng/panelmenu';


import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
import { FormBaseDynamicModule } from './shared/gh-form-base-dynamic/gh-form-base-dynamic.module';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { CustomHashLocationStrategy } from './shared/handlers/custom-hash-location-strategy';
import { RegistroDocumentoService } from './shared/services/registro-documento.service';
import {ArchivoListComponent } from './shared/archivos/archivos-list/archivo-list.component';
import { RolPermisoGroupComponent } from './rol/rol-permiso-group/rol-permiso-group.component';


registerLocaleData(localePy, 'es');

@NgModule({
    declarations: [
        NotificacionComponent,
        TipoDocumentoFormComponent,
        TipoDocumentoListComponent,
        ArchivoFormComponent,
    ArchivoListComponent,
        AppComponent,
        AppMainComponent,
        AppConfigComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppInlineMenuComponent,
        AppRightMenuComponent,
        AppBreadcrumbComponent,
        AppTopBarComponent,
        AppFooterComponent,
        LoginComponent,
        UsuarioPassComponent,
        PermisoListComponent,
        PermisoFormComponent,
        AuditoriaListComponent,
        UsuarioListComponent,
        UsuarioFormComponent,
        RolListComponent,
        RolFormComponent,
        RolPermisoComponent,
        RolPermisoGroupComponent,
        LoginCallbackComponent,


    ],
    imports: [
        PickListModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        AccordionModule,
        AutoCompleteModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CheckboxModule,
        ConfirmDialogModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FieldsetModule,
        FileUploadModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        MenuModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        ProgressBarModule,
        RadioButtonModule,
        RippleModule,
        SelectButtonModule,
        SidebarModule,
        TableModule,
        TabViewModule,
        TagModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        BlockUIModule,
        ProgressSpinnerModule,
        EditorModule,
        FormBaseDynamicModule,
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: AuthorizationHeaderInterceptorService, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptorService, multi: true},
        {provide: LocationStrategy, useClass: CustomHashLocationStrategy},
        {provide: LOCALE_ID, useValue: 'es-PY'},
        MenuService,
        AppBreadcrumbService,
        CookiesStorageService,
        LocalStorageService,
        PermissionGuardService,
        LoginService,
        ConfirmationService,
        MessageService,
        RegistroDocumentoService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
