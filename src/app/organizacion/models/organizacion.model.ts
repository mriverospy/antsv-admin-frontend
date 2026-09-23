import {TipoOrganizacion} from "../../shared/models/tipo-organizacion.model";
import {Rubro} from "../../shared/models/rubro.model";
import {Usuario} from "../../usuario/models/usuario.model";

export class Organizacion {
    idOrganizacion: number;
    nombre: string;
    nombreFantasia: string;
    descripcion: string;
    resumen: string;
    nroDocumento: string;
    correoElectronico: string;
    telefonoMovil: string;
    cantidadPersonas: string;
    origen: string;
    tipoOrganizacion: TipoOrganizacion;
    idCatalogoHtv: number;
    idRubro: number;
    esRepresentanteLegal: boolean;
    estado: string;
    representanteLegal: string;
    tipoSociedad: string;
    idDeclaracionJurada: string;
    declaracionJuradaBase64: string;
    declaracionJuradaNombre: string;
    observacion: string;
    rubros: Rubro[];
    fechaCreacion: string;
    fechaModificacion: string;
    fechaConstitucion: string;
    sectorIndustria: string;
    paginaWebRedes: string;
    estadoProyecto: string;
    referenteNombre: string;
    referenteCargo: string;
    //Entidades Gobierno
    dependencia: string;
    direccion: string;
    tipo: string;
    tiempoDedicadoActividad: string;
    //Academia
    areaEspecializacion: string;
    cantidadAlumnos: number;

    referenciaImagen : string;
    referenciaImagenBase64 : string;

    idSeccionContenido?: number;
    usuarioCreacion?: Usuario;
    
    idRecurso?: number;
    cantidadArchivos?: number;
}
