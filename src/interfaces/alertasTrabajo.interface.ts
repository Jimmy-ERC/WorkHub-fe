export interface AlertasTrabajo {
    success: boolean;
    data:    Datum[];
    message: string;
}

export interface Datum {
    id_notificacion:   number;
    tipo:              string;
    mensaje:           string;
    leido:             boolean;
    enviado_en:        Date;
    id_aplicacion:     number;
    id_trabajo:        number;
    nombre_trabajo:    string;
    modalidad:         string;
    ubicacion:         string;
    salario_minimo:    number;
    salario_maximo:    number;
    fecha_expiracion:  Date;
    estado_trabajo:    boolean;
    id_perfil_empresa: number;
    nombre_empresa:    string;
    logo_empresa:      string;
}
