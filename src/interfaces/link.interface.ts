export interface Link {
  id: number;
  url: string;
  id_perfil: number;
  id_categoria: number;
  titulo: string | null;
  descripcion: string | null;
  link_imagen: string | null;
  favicon: string | null;
  fecha_creacion?: Date;
}