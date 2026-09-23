import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  
  constructor() { }
  
  /**
   * Convierte un objeto Date a formato string 'dd-MM-yyyy'
   */
  dateToString(date: Date | null | undefined): string | null {
    if (!date) return null;
    
    // Asegurarse de que date sea un objeto Date válido
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return null;
    
    const day = validDate.getDate().toString().padStart(2, '0');
    const month = (validDate.getMonth() + 1).toString().padStart(2, '0');
    const year = validDate.getFullYear();
    
    return `${day}-${month}-${year}`;
  }
  
  /**
   * Convierte un string con formato 'dd-MM-yyyy' a un objeto Date
   */
  stringToDate(dateString: unknown): Date | null {
    if (dateString == null) return null;

    // Si ya es fecha, retornarla directamente
    if (dateString instanceof Date) return dateString as Date;

    // Si no es un string, intentar con el constructor Date
    if (typeof dateString !== 'string') {
      const dateFromNonString = new Date(dateString as any);
      return isNaN(dateFromNonString.getTime()) ? null : dateFromNonString;
    }

    // Ya es string
    const ds = dateString as string;

    // Si el string ya tiene formato 'dd-MM-yyyy'
    if (/^\d{2}-\d{2}-\d{4}$/.test(ds)) {
      const [day, month, year] = ds.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    // Si viene con formato ISO (yyyy-MM-dd) o con T (yyyy-MM-ddTHH:mm:ss)
    if (ds.indexOf('-') !== -1) {
      let tmp = ds;
      if (tmp.indexOf('T') !== -1) {
        tmp = tmp.split('T')[0];
      }

      const parts = tmp.split('-');
      if (parts.length === 3) {
        // Si parece estar en formato 'yyyy-MM-dd'
        if (parts[0].length === 4) {
          const [year, month, day] = parts.map(Number);
          return new Date(year, month - 1, day);
        }
        // Si parece estar en otro formato con guiones
        else {
          const date = new Date(tmp);
          return isNaN(date.getTime()) ? null : date;
        }
      }
    }

    // Como último recurso, intentar parsear directamente
    const date = new Date(ds);
    return isNaN(date.getTime()) ? null : date;
  }
  
  /**
   * Convierte valores de formulario a formato para el modelo (para enviar al servidor)
   * Útil para procesar los valores antes de enviarlos a la API
   */
  prepareFormDatesToModel(formValues: any): any {
    const result = { ...formValues };
    
    // Recorrer todas las propiedades buscando fechas (objetos Date)
    for (const key in result) {
      if (result[key] instanceof Date) {
        result[key] = this.dateToString(result[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Convierte valores del modelo a formato para el formulario (para cargar en campos de fecha)
   * Útil para procesar los valores recibidos del servidor antes de mostrarlos en el formulario
   */
  prepareModelDatesToForm(modelValues: any): any {
    const result = { ...modelValues };
    
    // Procesar todas las propiedades que parezcan fechas en formato string
    for (const key in result) {
      if (typeof result[key] === 'string' && 
          (result[key].includes('-') || result[key].includes('/'))) {
        result[key] = this.stringToDate(result[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Validador para verificar que una fecha no esté en el futuro
   */
  isDateInFuture(date: Date | null | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }
  
  /**
   * Procesa un objeto MiembroHogar para prepararlo para el formulario
   */
  prepareMiembroForForm(miembro: any): any {
    const resultado = { ...miembro };
    
    // Convertir fecha de nacimiento
    if (resultado.fechaNacimiento) {
      resultado.fechaNacimiento = this.stringToDate(resultado.fechaNacimiento);
    }
    
    return resultado;
  }
  
  /**
   * Procesa un objeto MiembroHogar para prepararlo para el modelo
   */
  prepareMiembroForModel(miembro: any): any {
    const resultado = { ...miembro };
    
    // Convertir fecha de nacimiento
    if (resultado.fechaNacimiento instanceof Date) {
      resultado.fechaNacimiento = this.dateToString(resultado.fechaNacimiento);
    }
    
    return resultado;
  }

  dateToISOString(date: Date | null | undefined): string | null {
    if (!date) return null;
    
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return null;
    
    const year = validDate.getFullYear();
    const month = (validDate.getMonth() + 1).toString().padStart(2, '0');
    const day = validDate.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  convertStringToDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') return null;

    // Si es formato ISO (detectamos si tiene "T" y al menos 3 partes separadas por "-")
    if (dateString.includes('T') && dateString.split('-').length === 3) {
      const isoDate = new Date(dateString);
      return isNaN(isoDate.getTime()) ? null : isoDate;
    }

    // Si la fecha está en formato dd-mm-yyyy
    const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (ddmmyyyyRegex.test(dateString)) {
      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    }

    // Intentar parsear directamente como último recurso
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };


}