// Estructura base de Job
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
  fecha_publicacion?: string;
  nivel: string;
  ubicacion: string;
  cupos: number;
  aplicar_por: string;
  estado?: boolean;


  nombre_empresa?: string;
  logo_empresa?: string;

  // Información de la empresa (desde el backend mejorado en otros endpoints)
  empresa?: {
    id_perfil: number;
    nombre: string;
    biografia?: string;
    link_foto_perfil?: string;
    email?: string;
    telefono?: string;
    ubicacion?: string;
    pagina_web?: string;
    red_social?: string;
    fecha_nacimiento_fundacion?: string;
  };

  // Información de la categoría (desde el backend mejorado)
  categoria?: {
    id_categoria: number;
    nombre_categoria: string;
    descripcion?: string;
  };
}
