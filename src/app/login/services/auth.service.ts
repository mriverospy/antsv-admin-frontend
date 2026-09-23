import { Injectable } from '@angular/core';
import {HttpErrorHandler} from "../../shared/handlers/http.error.handler";
import {HttpClient} from "@angular/common/http";
import {StorageManagerService} from "../../shared/services/storage-manager.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'api/auth';

  private handler: HttpErrorHandler = new HttpErrorHandler();

  constructor(
      private http: HttpClient,
      private storageManager: StorageManagerService
  ) { }

  // En auth.service.ts
  setPassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword }; // Mapea al JSON que espera tu Spring Boot
    return this.http.post(`${this.apiUrl}/set-password`, body);
  }

}
