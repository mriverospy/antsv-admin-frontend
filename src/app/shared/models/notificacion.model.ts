export interface Notificacion {
    idNotificacion: number;
    idRecordatorio?: number;
    idCronogramaActividad?: number;
    idUsuario?: number;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fechaCreacion: Date;
    fechaLectura?: Date;
    tipo?: string; // 'inscripcion', 'evento', 'organizacion', 'noticia'
    icono?: string; // Icono de PrimeNG
    enlace?: string; // URL opcional para navegar
    estado: string;
}

export interface RecordatorioModel {
    idRecordatorio: number;
    titulo: string;
    descripcion: string;
    horasAntes: number;
    activo: boolean;
    fechaCreacion: Date;
    fechaModificacion?: Date;
}