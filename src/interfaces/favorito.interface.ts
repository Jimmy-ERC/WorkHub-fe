// Interfaces para el manejo de favoritos

export interface Favorito {
  id_favorito: number;
  id_perfil: number;
  id_trabajo: number;
}

export interface AgregarFavoritoDTO {
  id_perfil: number;
  id_trabajo: number;
}

export interface FavoritoResponse {
  success: boolean;
  data?: Favorito;
  message: string;
}
