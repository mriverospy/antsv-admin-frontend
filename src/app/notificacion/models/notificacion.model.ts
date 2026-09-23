export interface Notificacion {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  estado: string;
  emisor: string;
  fechaEmision: Date;
  fechaLectura?: Date;
  idUsuarioDestino?: number;
  idOrganizacionDestino?: number;
}


export interface NotificacionUI extends Notificacion {
  leido: boolean;
}