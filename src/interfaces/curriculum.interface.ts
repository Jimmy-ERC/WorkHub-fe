export interface Curriculum {
  id_curriculum: number;
  id_perfil: number;
  url_curriculum: string;
  nombre_archivo: string;
  tamano_archivo: number; // en bytes
  fecha_subida: string;
}

export interface CurriculumResponse {
  success: boolean;
  data: Curriculum[];
  message: string;
}

export interface CurriculumResponseError {
  success: boolean;
  message: string;
}

export interface CurriculumUploadResult {
  success: boolean;
  data?: Curriculum;
  message: string;
}
