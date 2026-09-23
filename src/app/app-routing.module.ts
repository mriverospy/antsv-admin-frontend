import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppMainComponent } from './app.main.component';
import { UsuarioListComponent } from './usuario/usuario-list/usuario-list.component';
import { RolListComponent } from './rol/rol-list/rol-list.component';
import { PermisoListComponent } from './permiso/permiso-list/permiso-list.component';
import { AuditoriaListComponent } from './auditoria/auditoria-list/auditoria-list.component';
import { TipoDocumentoListComponent } from './tipo-documento/tipo-documento-list/tipo-documento-list.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { NotificacionComponent } from './notificacion/notificacion.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { SetPasswordComponent } from './login/set-password/set-password.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'redirect', component: LoginCallbackComponent },
  { path: 'set-password', component: SetPasswordComponent },
  { path: '', component: AppMainComponent, children: [
    { path: '', redirectTo: 'perfil', pathMatch: 'full' },
    { path: 'home', redirectTo: 'perfil', pathMatch: 'full' },
    { path: 'tablero-general', redirectTo: 'perfil', pathMatch: 'full' },
    { path: 'mi-perfil', redirectTo: 'perfil', pathMatch: 'full' },
    { path: 'usuario', component: UsuarioListComponent },
    { path: 'rol', component: RolListComponent },
    { path: 'permiso', component: PermisoListComponent },
    { path: 'auditoria', component: AuditoriaListComponent },
    { path: 'tipo-documento', component: TipoDocumentoListComponent },
    { path: 'perfil', component: MiPerfilComponent },
    { path: 'notificaciones', component: NotificacionComponent },
    { path: '**', component: NotfoundComponent }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
