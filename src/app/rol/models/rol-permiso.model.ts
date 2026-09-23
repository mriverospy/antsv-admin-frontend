import { Permiso } from "../../permiso/models/permiso.model";
import { Rol } from './rol.model';

export class RolPermiso {
    rol: Rol;
    permisos: Permiso[];
}
