import { Rol } from "../../rol/models/rol.model";
import {MetodoRegistro} from "../../metodo-registro/models/metodo-registro.model";

export class Usuario {
    idUsuario?: number;
    username: string;
    password: string;
    password2: string;
    nombre: string;
    tipoDocumento: string;
    nroDocumento: string
    apellido: string;
    nacionalidad: string;
    fechaExpiracion: string;
    permisos: string[];
    roles: Rol[];
    estado: boolean;
    cargo: string;
    direccion: string;
    telefono: string;
    correo: string;
    idTipoUsuario: number;
    estadoRegistro: string;
    metodoRegistros?: MetodoRegistro[];
    
    // Campos para la relación con organización
    idOrganizacion?: number;
    nombreOrganizacion?: string;



}

