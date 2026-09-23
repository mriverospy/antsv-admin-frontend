export interface MiPerfilInfo {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  biografia: string;
  imagenPerfilBase64?: string; // Opcional, nombreArchivo + base64Data
}