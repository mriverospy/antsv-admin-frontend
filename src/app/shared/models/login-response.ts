import { Usuario } from "src/app/usuario/models/usuario.model";
import { Permiso } from "../../permiso/models/permiso.model";
import {Organizacion} from "../../organizacion/models/organizacion.model";

export class LoginResponse {
    accessToken: string;
    refreshToken: string;
	usuario: Usuario;
	permisos: Permiso[];
    organizacion: Organizacion;
}
