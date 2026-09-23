import { Permiso } from "../../permiso/models/permiso.model";

export class Rol {
    idRol: number;
    descripcion: string;
    nombre: string;
    permisos: Permiso[];
    estado: boolean;
}
