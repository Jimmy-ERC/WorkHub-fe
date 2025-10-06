
export interface Foro {
  id_foro: number;
  id_categoria: number;
  id_perfil: number;
  titulo: string;
  contenido: string;
  fecha: Date;
}

export interface CrearRespuestaDTO{
    id_foro: number,
    id_perfil: number,
    contenido: string,
    fecha: Date
}