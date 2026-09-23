export class Archivo {
  idArchivo?: number;

  idRecurso: number; 
  referenciaArchivo: string; // formato: "nombreArchivo,base64Data"

  nombreArchivo: string 

  fechaCreacion?: Date; 
  estado?: boolean; 
  archivoBase64?: string;
  tipoMime?: string;
  idEvento?: number;
  tipoArchivo?: string;
  idTipoDocumento?: number;
  nombreTipoDocumento?: string;

  constructor(
    idRecurso: number,
    referenciaArchivo: string,
    archivoBase64?: string
  ) {
    this.idRecurso = idRecurso;
    this.referenciaArchivo = referenciaArchivo;
    this.archivoBase64 = archivoBase64;
    this.estado = true;
    this.fechaCreacion = new Date();
  }
}
