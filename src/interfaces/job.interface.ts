// Nueva estructura de Job
export interface Job {
    id_trabajo: number;
    id_perfil: number;
    id_categoria: number;
    nombre_trabajo: string;
    descripcion: string;
    responsabilidades: string;
    salario_minimo: number;
    salario_maximo: number;
    modalidad: string;
    educacion: string;
    experiencia: string;
    fecha_expiracion: string;
    nivel: string;
    ubicacion: string;
    estado: boolean;
}