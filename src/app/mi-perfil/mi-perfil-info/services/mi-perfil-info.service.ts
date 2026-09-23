import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { MiPerfilInfo } from '../models/mi-perfil-info.models';
import { MessageResponse } from 'src/app/shared/models/message-response.model';


@Injectable({
  providedIn: 'root'
})
export class MiPerfilService {

  private apiUrl = 'api/usuario'; 

  // BehaviorSubject para compartir la imagen del perfil entre componentes
  private imagenPerfilSubject = new BehaviorSubject<string>('');
  public imagenPerfil$ = this.imagenPerfilSubject.asObservable();

  constructor(private http: HttpClient) { }

  obtenerMiPerfil(id: number): Observable<MiPerfilInfo> {
     return this.http.get<MiPerfilInfo>(`/api/usuario/getProfile/${id}`);
  }

  actualizarPerfil(id: number, formData: FormData): Observable<MessageResponse> {
  
    return this.http.put<MessageResponse>(`${this.apiUrl}/updateMyProfile/${id}`, formData);

  }

  // Método para notificar cambios en la imagen del perfil
  actualizarImagenPerfil(imagenUrl: string): void {
    this.imagenPerfilSubject.next(imagenUrl);
  }
  

}
