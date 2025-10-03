export interface TrabajosAplicadosInterface {
    success: boolean;
    data: DataTrabajosAplicados[];
    message: string;
}

export interface DataTrabajosAplicados {
    id_aplicacion: number;
    id_usuario: string;
    id_candidato: number;
    id_trabajo: number;
    link_foto_perfil: string;
    nombre_trabajo: string;
    modalidad: string;
    ubicacion: string;
    salario_minimo: number;
    salario_maximo: number;
    fecha_expiracion: Date;
    estado_aplicacion: string;
    id_perfil_empresa: number;
    nombre_empresa: string;
    logo_empresa: string;
    estado_trabajo: boolean;
    mensaje: string;
    id_curriculum: number;
}
