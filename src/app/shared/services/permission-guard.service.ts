import { Injectable } from '@angular/core';
import { StorageManagerService } from './storage-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuardService {

  constructor(private storageManager: StorageManagerService) { }

  hasPermission(permission: string): boolean {
    const currentSession = this.storageManager.getCurrenSession();
    if (!currentSession || !currentSession.permisos) {
      return false;
    }
    const verifyPermission = currentSession.permisos.find(perm => perm.authority === permission);
    if(verifyPermission && verifyPermission != null) {
      return true;
    }
    return false;
  }

}
