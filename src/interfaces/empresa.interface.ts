export interface Empresa {
    id_seguido: number;
    nombre_seguido: string;
    foto_seguido: string;
    id_seguidor: number;
    es_seguida: boolean;
    ubicacion_seguido: string;
    te_sigue: boolean; // Propiedad opcional
}
