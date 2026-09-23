import { Injectable, OnInit, OnDestroy } from '@angular/core';
import {LocalStorageService} from 'ngx-store';
import { UserSession } from '../models/usersession.model';

@Injectable({
  providedIn: 'root'
})
export class StorageManagerService implements OnInit, OnDestroy {

  constructor(
    private localStorageService: LocalStorageService,
    //private cookieService: CookiesStorageService
  ) { }

  ngOnInit() { }

  ngOnDestroy() { }

  saveAccessToken(accessToken: string) {
    this.localStorageService.set('access_token', accessToken);
  }

  saveRefreshToken(refreshToken: string) {
    this.localStorageService.set('refresh_token', refreshToken);
  }

  public getAccessToken(): string {
    return this.localStorageService.get('access_token');
  }

  public getRefreshToken(): string {
    return this.localStorageService.get('refresh_token');
  }

  saveSession(data: UserSession) {
    this.localStorageService.set('current_user', data);
  }

  public getCurrenSession(): UserSession {
    return this.localStorageService.get('current_user');
  }

  deleteStorage() {
    this.localStorageService.clear();
  }
}
