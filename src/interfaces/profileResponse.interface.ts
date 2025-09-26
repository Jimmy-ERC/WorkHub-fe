export interface ProfileResponseError {
    success: boolean;
    message: string;
}

export interface ProfileResponse {
    success: boolean;
    data:    Data;
    message: string;
}

export interface Data {
    id_perfil:  number;
    id_usuario: string;
    nombre:     string;
    biografia:  string;
    telefono:   string;
    ubicacion:  string;
    fecha_nacimiento_fundacion: string;
    pagina_web: string;
    red_social: string;
    email:      string;
}

