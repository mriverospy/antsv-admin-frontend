export class Auditoria {
    idAuditoria:   number;
    idRegistro:    string;
    idUsuario:     number;
    valor:         string;
    accion:        string;
    fechaHora:     string;
    nombreTabla:   string;
    ipUsuario:     string;
    metodo:        string;
    modulo:        string;
    nombreUsuario: string;
    roles:         string;
    tipoEvento:    string;
    username:      string;
}

export class AuditoriaTable {
    lista: Auditoria[];
    totalRecords: number;
}