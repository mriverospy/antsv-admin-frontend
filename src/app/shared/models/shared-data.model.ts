export interface Field {
    maxFileSize: number;
    name: string;
    label: string;
    type: string;
    options?: any[];
    validation?: boolean;
    validationMessage?: string;
    onChangeAction?: Function;
    columns: number;
    multiple?: boolean;
    patternErrorMessage?: string;
    allowedExtensions?: string;
    allowedMimeTypes?: string;
    accept?: string;
  }
  
export interface Departamento {
    label: string;
    value: string;
    distritos: { coddpto: string, label: string; value: string; }[];
}

export interface SelectDropDown {
    label: string;
    value: string;
}

export const optViolentometro = [
  { value: '1', label: 'SI' }, 
  { value: '2', label: 'A VECES' },
  { value: '3', label: 'NO' }
];
  
export const listaDefault = [
  { value: 'SI', label: 'SI' }, 
  { value: 'NO', label: 'NO' }
];

export const listaDefault2 = [
  { value: 'SI', label: 'SI' }, 
  { value: 'NO', label: 'NO' },
  { value: 'NS', label: 'NS/NC' },
];

export const listaDefault3 = [
  { value: 'SI', label: 'SI' }, 
  { value: 'NO', label: 'NO' },
  { value: 'NR', label: 'No Reporta' },
];

export const agresorTieneAntecedentes = [
  { value: 'SI', label: 'SI' }, 
  { value: 'NO', label: 'NO' },
  { value: 'NS', label: 'No Sabe / No Reporta' },
];

export const vivenJuntos = [
  { value: 'SI', label: 'SI' }, 
  { value: 'NO', label: 'NO (Definitivamente)' }
];

export const frecuenciaIncidentes = [
  { value: 'Primera Vez', label: 'Primera Vez' }, 
  { value: 'Pocas Veces', label: 'Pocas Veces' },
  { value: 'Muchas Veces', label: 'Muchas Veces' },
];

export const sexo = [
  { value: 'Masculino', label: 'Masculino' }, 
  { value: 'Femenino', label: 'Femenino' }
];

export const atencionSocial = [
  { value: 'aplicacionDeFichas', label: 'Aplicación de Fichas' },
  { value: 'articulacionDeInstituciones', label: 'Articulación de Instituciones' },
  { value: 'recepcionDeUsuaria', label: 'Recepción de Usuaria' }
];

export const atencionLegal = [
  { value: 'atencionLegal', label: 'Atención Legal' },
  { value: 'atencionPsicologica', label: 'Atención Psicológica' },
  { value: 'acompanhamiento', label: 'Acompañamiento' }
];

export const tipoDocumentos:SelectDropDown[] = [
  { value: 'cedula', label: 'C.I Paraguaya' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'noTiene', label: 'No Tiene' },
  { value: 'noRecuerda', label: 'No Recuerda' },
  { value: 'documentoExtranjero', label: 'Doc. Extranjera' },
];

export const pais: SelectDropDown[] = [
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Brasil', label: 'Brasil' },
];

export const nacionalidades: SelectDropDown[] = [
  { value: 'paraguaya', label: 'Paraguaya' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'brasilera', label: 'Brasilera' },
];

export const estadoCivil: SelectDropDown[] = [
  { value: 'soltero', label: 'Soltero' },
  { value: 'casado', label: 'Casado' },
  { value: 'unido', label: 'Unido' },
  { value: 'viudo', label: 'Viudo' },
  { value: 'separado', label: 'Separado' },
  { value: 'divorciado', label: 'Divorciado' },
];

export const eventos: SelectDropDown[] = [
  { value: 'evento1', label: 'Violencia física' },
  { value: 'evento2', label: 'Violencia verbal' },
  { value: 'evento3', label: 'Violencia psicológica' },
];

export const presentaLimitacion: SelectDropDown[] = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'fisicaMotriz', label: 'Física o Motriz' },
  { value: 'intelectual', label: 'Intelectual' },
  { value: 'psicosocial', label: 'Psicosocial' },
];

export const nivelIngresos: SelectDropDown[] = [
  { value: 'noTieneIngreso', label: 'No tiene ingreso' },
  { value: 'menosDe1', label: 'Menos de 1.000.000' },
  { value: 'entre1yMenosDe3', label: 'Entre 1.000.000 y menos de 3.000.000' },
  { value: 'entre3yMenosDe6', label: 'Entre 3.000.000 y menos de 6.000.000' },
  { value: 'masDe6', label: 'Mas de 6.000.000' },
  { value: 'noReporta', label: 'No reporta' },
];

export const relacionPersona: SelectDropDown[] = [
  { value: 'esposo', label: 'Esposo' },
  { value: 'exEsposo', label: 'Ex Esposo' },
  { value: 'concubino', label: 'Concubino' },
  { value: 'exConcubino', label: 'Ex Concubino' },
  { value: 'novio', label: 'Novio' },
  { value: 'exNovio', label: 'Ex Novio' },
  { value: 'padreMadre', label: 'Padre/Madre' },
  { value: 'padrastroMadrastra', label: 'Padrastro/Madrastra' },
  { value: 'hijo', label: 'Hijo/a' },
  { value: 'desconocido', label: 'Desconocido' },
];

export const nivelEducativo: SelectDropDown[] = [
  { value: 'Paraguaya', label: 'Ninguno' },
  { value: 'educacionInicial', label: 'Educación Inicial' },
  { value: 'eeb12cIncompleto', label: 'Educación Escolar Básica 1 y 2 ciclo (Ex primaria) - Incompleto ' },
  { value: 'eeb3cCompleto', label: 'Educación Escolar Básica 3er ciclo (Ex Secundaria Básica) - Completo' },
  { value: 'eeb3cIncompleto', label: 'Educación Escolar Básica 3er ciclo (Ex Secundaria Básica) - Incompleto' },
  { value: 'emCompleto', label: 'Educación Media (Bachillerato) - Completo' },
  { value: 'emIncompleto', label: 'Educación Media (Bachillerato) - Incompleto' },
  { value: 'esnuCompleto', label: 'Educación Superior No Universitaria - Completo' },
  { value: 'esnuIncompleto', label: 'Educación Superior No Universitaria - Incompleto' },
  { value: 'esuCompleto', label: 'Educación Superior Universitaria - Completo' },
  { value: 'esuIncompleto', label: 'Educación Superior Universitaria - Incompleto' },
];

export const lugarDelUltimoHecho: SelectDropDown[] = [
  { value: 'domicilioParticular', label: 'Domicilio Particular' },
  { value: 'domicilioTercero', label: 'Domicilio de Terceros' },
  { value: 'lugarTrabajo', label: 'Lugar de Trabajo' },
  { value: 'viaPublica', label: 'Vía Pública / Calle' },
  { value: 'hotelMotel', label: 'Hotel / Motel' },
  { value: 'comunidadEducativa', label: 'Comunidad Educativa' },
  { value: 'comunidadReligiosa', label: 'Comunidad Religiosa' },
  { value: 'comunidadRecreativa', label: 'Comunidad Recreativa' },
  { value: 'medioTransporte', label: 'Medio de Transporte' },
];

export const tipoArma = [
  { value: 'armaFuego', label: 'Arma de Fuego' }, 
  { value: 'armaBlanca', label: 'Arma Blanca' }
];

export const agresorDetenido = [
  { value: 'si', label: 'Sí, detenido' }, 
  { value: 'profugo', label: 'Está profugo' },
  { value: 'libre', label: 'Está libre' },
  { value: 'noSabe', label: 'No sabe' }
];

export const localidades = [
  { value: '1', label: 'localidad 1' }, 
  { value: '2', label: 'localidad 2' }
];

export const departamentos: Departamento[] = [
  {value: "00", label: "ASUNCION" , distritos: [
      {coddpto : "00", value: "00", label: "ASUNCION"}
    ]},
  {value: "01", label: "CONCEPCION" , distritos: [
      {coddpto : "01", value: "01", label: "CONCEPCION",},
      {coddpto : "01", value: "02", label: "BELEN",},
      {coddpto : "01", value: "03", label: "HORQUETA",},
      {coddpto : "01", value: "04", label: "LORETO",},
      {coddpto : "01", value: "05", label: "SAN CARLOS DEL APA",},
      {coddpto : "01", value: "06", label: "SAN LAZARO",},
      {coddpto : "01", value: "07", label: "YBY YAU",},
      {coddpto : "01", value: "08", label: "AZOTE'Y",},
      {coddpto : "01", value: "09", label: "SARGENTO JOSE FELIX LOPEZ",},
      {coddpto : "01", value: "10", label: "SAN ALFREDO",},
      {coddpto : "01", value: "11", label: "PASO BARRETO",},
      {coddpto : "01", value: "12", label: "ARROYITO",},
      {coddpto : "01", value: "13", label: "PASO HORQUETA",},
      {coddpto : "01", value: "14", label: "ITACUA",},
    ]},
  {value: "02", label: "SAN PEDRO" , distritos: [
      {coddpto : "02", value: "14", label: "GENERAL FRANCISCO ISIDORO RESQUIN",},
      {coddpto : "02", value: "01", label: "SAN PEDRO DEL YCUAMANDYYU",},
      {coddpto : "02", value: "02", label: "ANTEQUERA",},
      {coddpto : "02", value: "03", label: "CHORE",},
      {coddpto : "02", value: "04", label: "GENERAL ELIZARDO AQUINO",},
      {coddpto : "02", value: "05", label: "ITACURUBI DEL ROSARIO",},
      {coddpto : "02", value: "06", label: "LIMA",},
      {coddpto : "02", value: "07", label: "NUEVA GERMANIA",},
      {coddpto : "02", value: "08", label: "SAN ESTANISLAO",},
      {coddpto : "02", value: "09", label: "SAN PABLO",},
      {coddpto : "02", value: "10", label: "TACUATI",},
      {coddpto : "02", value: "11", label: "UNION",},
      {coddpto : "02", value: "12", label: "25 DE DICIEMBRE",},
      {coddpto : "02", value: "13", label: "VILLA DEL ROSARIO",},
      {coddpto : "02", value: "15", label: "YATAITY DEL NORTE",},
      {coddpto : "02", value: "16", label: "GUAJAYVI",},
      {coddpto : "02", value: "17", label: "CAPIIBARY",},
      {coddpto : "02", value: "18", label: "SANTA ROSA DEL AGUARAY",},
      {coddpto : "02", value: "19", label: "YRYBUCUA",},
      {coddpto : "02", value: "20", label: "LIBERACION",},
      {coddpto : "02", value: "21", label: "SAN VICENTE PANCHOLO",},
      {coddpto : "02", value: "22", label: "SAN JOSE DEL ROSARIO",},
    ]},
  {value: "03", label: "CORDILLERA" , distritos: [
      {coddpto : "03", value: "01", label: "CAACUPE",},
      {coddpto : "03", value: "02", label: "ALTOS",},
      {coddpto : "03", value: "03", label: "ARROYOS Y ESTEROS",},
      {coddpto : "03", value: "04", label: "ATYRA",},
      {coddpto : "03", value: "05", label: "CARAGUATAY",},
      {coddpto : "03", value: "06", label: "EMBOSCADA",},
      {coddpto : "03", value: "07", label: "EUSEBIO AYALA",},
      {coddpto : "03", value: "08", label: "ISLA PUCU",},
      {coddpto : "03", value: "09", label: "ITACURUBI DE LA CORDILLERA",},
      {coddpto : "03", value: "10", label: "JUAN DE MENA",},
      {coddpto : "03", value: "11", label: "LOMA GRANDE",},
      {coddpto : "03", value: "12", label: "MBOCAYATY DEL YHAGUY",},
      {coddpto : "03", value: "13", label: "NUEVA COLOMBIA",},
      {coddpto : "03", value: "14", label: "PIRIBEBUY",},
      {coddpto : "03", value: "15", label: "PRIMERO DE MARZO",},
      {coddpto : "03", value: "16", label: "SAN BERNARDINO",},
      {coddpto : "03", value: "17", label: "SANTA ELENA",},
      {coddpto : "03", value: "18", label: "TOBATI",},
      {coddpto : "03", value: "19", label: "VALENZUELA",},
      {coddpto : "03", value: "20", label: "SAN JOSE OBRERO",},
    ]},
  {value: "04", label: "GUAIRA", distritos: [
    {coddpto : "04", value: "18", label: "TEBICUARY",},
    {coddpto : "04", value: "01", label: "VILLARRICA",},
    {coddpto : "04", value: "02", label: "BORJA",},
    {coddpto : "04", value: "03", label: "CAPITAN MAURICIO JOSE TROCHE",},
    {coddpto : "04", value: "04", label: "CORONEL MARTINEZ",},
    {coddpto : "04", value: "05", label: "FELIX PEREZ CARDOZO",},
    {coddpto : "04", value: "06", label: "GRAL. EUGENIO A. GARAY",},
    {coddpto : "04", value: "07", label: "COLONIA INDEPENDENCIA",},
    {coddpto : "04", value: "08", label: "ITAPE",},
    {coddpto : "04", value: "09", label: "ITURBE",},
    {coddpto : "04", value: "10", label: "JOSE FASSARDI",},
    {coddpto : "04", value: "11", label: "MBOCAYATY",},
    {coddpto : "04", value: "12", label: "NATALICIO TALAVERA",},
    {coddpto : "04", value: "13", label: "ÑUMI",},
    {coddpto : "04", value: "14", label: "SAN SALVADOR",},
    {coddpto : "04", value: "15", label: "YATAITY",},
    {coddpto : "04", value: "16", label: "DOCTOR BOTTRELL",},
    {coddpto : "04", value: "17", label: "PASO YOBAI",},
    {coddpto : "14", value: "13", label: "YBY PYTA",}
    ]},
  {value: "05", label: "CAAGUAZU" , distritos: [
      {coddpto : "05", value: "01", label: "CORONEL OVIEDO",},
      {coddpto : "05", value: "02", label: "CAAGUAZU",},
      {coddpto : "05", value: "03", label: "CARAYAO",},
      {coddpto : "05", value: "04", label: "DR. CECILIO BAEZ",},
      {coddpto : "05", value: "05", label: "SANTA ROSA DEL MBUTUY",},
      {coddpto : "05", value: "06", label: "DR. JUAN MANUEL FRUTOS",},
      {coddpto : "05", value: "07", label: "REPATRIACION",},
      {coddpto : "05", value: "08", label: "NUEVA LONDRES",},
      {coddpto : "05", value: "09", label: "SAN JOAQUIN",},
      {coddpto : "05", value: "10", label: "SAN JOSE DE LOS ARROYOS",},
      {coddpto : "05", value: "11", label: "YHU",},
      {coddpto : "05", value: "12", label: "DR. J. EULOGIO ESTIGARRIBIA",},
      {coddpto : "05", value: "13", label: "R.I. 3 CORRALES",},
      {coddpto : "05", value: "15", label: "JOSE DOMINGO OCAMPOS",},
      {coddpto : "05", value: "16", label: "MARISCAL FRANCISCO SOLANO LOPEZ",},
      {coddpto : "05", value: "17", label: "LA PASTORA",},
      {coddpto : "05", value: "18", label: "3 DE FEBRERO",},
      {coddpto : "05", value: "19", label: "SIMON BOLIVAR",},
      {coddpto : "05", value: "20", label: "VAQUERIA",},
      {coddpto : "05", value: "21", label: "TEMBIAPORA",},
      {coddpto : "05", value: "22", label: "NUEVA TOLEDO",},
      {coddpto : "05", value: "14", label: "RAUL ARSENIO OVIEDO",},
    ]},
  {value: "06", label: "CAAZAPA" , distritos: [
      {coddpto : "06", value: "07", label: "SAN JUAN NEPOMUCENO",},
      {coddpto : "06", value: "01", label: "CAAZAPA",},
      {coddpto : "06", value: "02", label: "ABAI",},
      {coddpto : "06", value: "03", label: "BUENA VISTA",},
      {coddpto : "06", value: "04", label: "DR. MOISES S. BERTONI",},
      {coddpto : "06", value: "05", label: "GRAL. HIGINIO MORINIGO",},
      {coddpto : "06", value: "06", label: "MACIEL",},
      {coddpto : "06", value: "08", label: "TAVAI",},
      {coddpto : "06", value: "09", label: "YEGROS",},
      {coddpto : "06", value: "10", label: "YUTY",},
      {coddpto : "06", value: "11", label: "3 DE MAYO",},
    ]},
  {value: "07", label: "ITAPUA" , distritos: [
      {coddpto : "07", value: "03", label: "CAMBYRETA",},
      {coddpto : "07", value: "01", label: "ENCARNACION",},
      {coddpto : "07", value: "02", label: "BELLA VISTA",},
      {coddpto : "07", value: "04", label: "CAPITAN MEZA",},
      {coddpto : "07", value: "05", label: "CAPITAN MIRANDA",},
      {coddpto : "07", value: "06", label: "NUEVA ALBORADA",},
      {coddpto : "07", value: "07", label: "CARMEN DEL PARANA",},
      {coddpto : "07", value: "08", label: "CORONEL BOGADO",},
      {coddpto : "07", value: "09", label: "CARLOS ANTONIO LOPEZ",},
      {coddpto : "07", value: "10", label: "NATALIO",},
      {coddpto : "07", value: "11", label: "FRAM",},
      {coddpto : "07", value: "12", label: "GENERAL ARTIGAS",},
      {coddpto : "07", value: "13", label: "GENERAL DELGADO",},
      {coddpto : "07", value: "14", label: "HOHENAU",},
      {coddpto : "07", value: "15", label: "JESUS",},
      {coddpto : "07", value: "16", label: "JOSE LEANDRO OVIEDO",},
      {coddpto : "07", value: "17", label: "OBLIGADO",},
      {coddpto : "07", value: "18", label: "MAYOR JULIO DIONISIO OTAÑO",},
      {coddpto : "07", value: "19", label: "SAN COSME Y DAMIAN",},
      {coddpto : "07", value: "20", label: "SAN PEDRO DEL PARANA",},
      {coddpto : "07", value: "21", label: "SAN RAFAEL DEL PARANA",},
      {coddpto : "07", value: "22", label: "TRINIDAD",},
      {coddpto : "07", value: "23", label: "EDELIRA",},
      {coddpto : "07", value: "24", label: "TOMAS ROMERO PEREIRA",},
      {coddpto : "07", value: "25", label: "ALTO VERA",},
      {coddpto : "07", value: "26", label: "LA PAZ",},
      {coddpto : "07", value: "27", label: "YATYTAY",},
      {coddpto : "07", value: "28", label: "SAN JUAN DEL PARANA",},
      {coddpto : "07", value: "29", label: "PIRAPO",},
      {coddpto : "07", value: "30", label: "ITAPUA POTY",},
    ]},
  {value: "08", label: "MISIONES" , distritos: [
      {coddpto : "08", value: "01", label: "SAN JUAN BAUTISTA DE LAS MISIONES",},
      {coddpto : "08", value: "02", label: "AYOLAS",},
      {coddpto : "08", value: "03", label: "SAN IGNACIO",},
      {coddpto : "08", value: "04", label: "SAN MIGUEL",},
      {coddpto : "08", value: "05", label: "SAN PATRICIO",},
      {coddpto : "08", value: "06", label: "SANTA MARIA",},
      {coddpto : "08", value: "07", label: "SANTA ROSA",},
      {coddpto : "08", value: "08", label: "SANTIAGO",},
      {coddpto : "08", value: "09", label: "VILLA FLORIDA",},
      {coddpto : "08", value: "10", label: "YABEBYRY",},
    ]},
  {value: "09", label: "PARAGUARI" , distritos: [
      {coddpto : "09", value: "01", label: "PARAGUARI",},
      {coddpto : "09", value: "02", label: "ACAHAY",},
      {coddpto : "09", value: "03", label: "CAAPUCU",},
      {coddpto : "09", value: "04", label: "CABALLERO",},
      {coddpto : "09", value: "05", label: "CARAPEGUA",},
      {coddpto : "09", value: "06", label: "ESCOBAR",},
      {coddpto : "09", value: "07", label: "LA COLMENA",},
      {coddpto : "09", value: "08", label: "MBUYAPEY",},
      {coddpto : "09", value: "09", label: "PIRAYU",},
      {coddpto : "09", value: "10", label: "QUIINDY",},
      {coddpto : "09", value: "11", label: "QUYQUYHO",},
      {coddpto : "09", value: "12", label: "ROQUE GONZALEZ DE SANTA CRUZ",},
      {coddpto : "09", value: "13", label: "SAPUCAI",},
      {coddpto : "09", value: "14", label: "TEBICUARY-MI",},
      {coddpto : "09", value: "15", label: "YAGUARON",},
      {coddpto : "09", value: "16", label: "YBYCUI",},
      {coddpto : "09", value: "17", label: "YBYTYMI",},
      {coddpto : "09", value: "18", label: "MARIA ANTONIA",},
    ]},
  {value: "10", label: "ALTO PARANA" , distritos: [
      {coddpto : "10", value: "08", label: "ÑACUNDAY",},
      {coddpto : "10", value: "01", label: "CIUDAD DEL ESTE",},
      {coddpto : "10", value: "02", label: "PRESIDENTE FRANCO",},
      {coddpto : "10", value: "03", label: "DOMINGO MARTINEZ DE IRALA",},
      {coddpto : "10", value: "04", label: "DR. JUAN LEON MALLORQUIN",},
      {coddpto : "10", value: "05", label: "HERNANDARIAS",},
      {coddpto : "10", value: "06", label: "ITAKYRY",},
      {coddpto : "10", value: "07", label: "JUAN E. O'LEARY",},
      {coddpto : "10", value: "09", label: "YGUAZU",},
      {coddpto : "10", value: "10", label: "LOS CEDRALES",},
      {coddpto : "10", value: "11", label: "MINGA GUAZU",},
      {coddpto : "10", value: "12", label: "SAN CRISTOBAL",},
      {coddpto : "10", value: "13", label: "SANTA RITA",},
      {coddpto : "10", value: "14", label: "NARANJAL",},
      {coddpto : "10", value: "15", label: "SANTA ROSA DEL MONDAY",},
      {coddpto : "10", value: "16", label: "MINGA PORA",},
      {coddpto : "10", value: "17", label: "MBARACAYU",},
      {coddpto : "10", value: "18", label: "SAN ALBERTO",},
      {coddpto : "10", value: "19", label: "IRUÑA",},
      {coddpto : "10", value: "20", label: "SANTA FE DEL PARANA",},
      {coddpto : "10", value: "21", label: "TAVAPY",},
      {coddpto : "10", value: "22", label: "DR. RAUL PEÑA",},
    ]},
  {value: "11", label: "CENTRAL" , distritos: [
      {coddpto : "11", value: "01", label: "AREGUA",},
      {coddpto : "11", value: "02", label: "CAPIATA",},
      {coddpto : "11", value: "03", label: "FERNANDO DE LA MORA",},
      {coddpto : "11", value: "04", label: "GUARAMBARE",},
      {coddpto : "11", value: "05", label: "ITA",},
      {coddpto : "11", value: "06", label: "ITAUGUA",},
      {coddpto : "11", value: "07", label: "LAMBARE",},
      {coddpto : "11", value: "08", label: "LIMPIO",},
      {coddpto : "11", value: "09", label: "LUQUE",},
      {coddpto : "11", value: "10", label: "MARIANO ROQUE ALONSO",},
      {coddpto : "11", value: "11", label: "NUEVA ITALIA",},
      {coddpto : "11", value: "12", label: "ÑEMBY",},
      {coddpto : "11", value: "13", label: "SAN ANTONIO",},
      {coddpto : "11", value: "14", label: "SAN LORENZO",},
      {coddpto : "11", value: "15", label: "VILLA ELISA",},
      {coddpto : "11", value: "16", label: "VILLETA",},
      {coddpto : "11", value: "17", label: "YPACARAI",},
      {coddpto : "11", value: "18", label: "YPANE",},
      {coddpto : "11", value: "19", label: "J. AUGUSTO SALDIVAR",},
    ]},
  {value: "12", label: "ÑEEMBUCU" , distritos: [
      {coddpto : "12", value: "01", label: "PILAR",},
      {coddpto : "12", value: "02", label: "ALBERDI",},
      {coddpto : "12", value: "03", label: "CERRITO",},
      {coddpto : "12", value: "04", label: "DESMOCHADOS",},
      {coddpto : "12", value: "05", label: "GRAL. JOSE EDUVIGIS DIAZ",},
      {coddpto : "12", value: "06", label: "GUAZU CUA",},
      {coddpto : "12", value: "07", label: "HUMAITA",},
      {coddpto : "12", value: "08", label: "ISLA UMBU",},
      {coddpto : "12", value: "09", label: "LAURELES",},
      {coddpto : "12", value: "10", label: "MAYOR JOSE DE JESUS MARTINEZ",},
      {coddpto : "12", value: "11", label: "PASO DE PATRIA",},
      {coddpto : "12", value: "12", label: "SAN JUAN BAUTISTA DE ÑEEMBUCU",},
      {coddpto : "12", value: "13", label: "TACUARAS",},
      {coddpto : "12", value: "14", label: "VILLA FRANCA",},
      {coddpto : "12", value: "15", label: "VILLA OLIVA",},
      {coddpto : "12", value: "16", label: "VILLALBIN",},
    ]},
  {value: "13", label: "AMAMBAY" , distritos: [
      {coddpto : "13", value: "01", label: "PEDRO JUAN CABALLERO",},
      {coddpto : "13", value: "02", label: "BELLA VISTA",},
      {coddpto : "13", value: "03", label: "CAPITAN BADO",},
      {coddpto : "13", value: "04", label: "ZANJA PYTA",},
      {coddpto : "13", value: "05", label: "KARAPAI",},
      {coddpto : "13", value: "06", label: "CERRO CORA",},
    ]},	
  {value: "14", label: "CANINDEYU" , distritos: [
      {coddpto : "14", value: "01", label: "SALTO DEL GUAIRA",},
      {coddpto : "14", value: "02", label: "CORPUS CHRISTI",},
      {coddpto : "14", value: "03", label: "VILLA CURUGUATY",},
      {coddpto : "14", value: "04", label: "VILLA YGATIMI",},
      {coddpto : "14", value: "05", label: "ITANARA",},
      {coddpto : "14", value: "06", label: "YPEJHU",},
      {coddpto : "14", value: "07", label: "FRANCISCO CABALLERO ALVAREZ",},
      {coddpto : "14", value: "08", label: "KATUETE",},
      {coddpto : "14", value: "09", label: "LA PALOMA DEL ESPIRITU SANTO",},
      {coddpto : "14", value: "10", label: "NUEVA ESPERANZA",},
      {coddpto : "14", value: "11", label: "YASY KAÑY",},
      {coddpto : "14", value: "12", label: "YBYRAROBANA",},
      {coddpto : "14", value: "14", label: "MARACANA",},
      {coddpto : "14", value: "15", label: "PUERTO ADELA",},
      {coddpto : "14", value: "16", label: "LAUREL",},
    ]},
  {value: "15", label: "PRESIDENTE HAYES" , distritos: [
      {coddpto : "15", value: "04", label: "VILLA HAYES",},
      {coddpto : "15", value: "02", label: "BENJAMIN ACEVAL",},
      {coddpto : "15", value: "08", label: "TENIENTE ESTEBAN MARTINEZ",},
      {coddpto : "15", value: "11", label: "NUEVA ASUNCION",},
      {coddpto : "15", value: "10", label: "CAMPO ACEVAL",},
      {coddpto : "15", value: "07", label: "TTE 1RO MANUEL IRALA FERNANDEZ",},
      {coddpto : "15", value: "09", label: "GENERAL JOSE MARIA BRUGUEZ",},
      {coddpto : "15", value: "03", label: "PUERTO PINASCO",},
      {coddpto : "15", value: "06", label: "JOSE FALCON",},
      {coddpto : "15", value: "05", label: "NANAWA",},
    ]},
  {value: "16", label: "BOQUERON" , distritos: [
      {coddpto : "16", value: "05", label: "LOMA PLATA",},
      {coddpto : "16", value: "04", label: "FILADELFIA",},
      {coddpto : "16", value: "02", label: "MARISCAL JOSE FELIX ESTIGARRIBIA",},
      {coddpto : "16", value: "06", label: "BOQUERON",},
    ]},
  {value: "17", label: "ALTO PARAGUAY" , distritos: [
      {coddpto : "17", value: "01", label: "FUERTE OLIMPO",},
      {coddpto : "17", value: "02", label: "PUERTO CASADO",},
      {coddpto : "17", value: "04", label: "BAHIA NEGRA",},
      {coddpto : "17", value: "05", label: "CARMELO PERALTA",},
    ]},
];