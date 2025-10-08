import type { TrabajosFavoritosInterface } from "@/interfaces/trabajosFavoritos.interface";
import type { AgregarFavoritoDTO, FavoritoResponse } from "@/interfaces/favorito.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

// Tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase();

/**
 * Servicio para manejar las operaciones relacionadas con los trabajos favoritos
 */
export class FavoriteJobsService {

    constructor() { }

    /**
     * Agrega un trabajo a favoritos
     * @param datos - Datos del favorito (id_perfil, id_trabajo)
     */
    public static async addFavorite(datos: AgregarFavoritoDTO): Promise<FavoritoResponse> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/trabajos/favoritos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                data: data.data,
                message: data.message || 'Trabajo agregado a favoritos exitosamente'
            };
        } catch (error) {
            console.error('Error adding favorite job:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al agregar favorito'
            };
        }
    }

    /**
     * Obtiene TODOS los trabajos favoritos del candidato
     * Este método obtiene la lista completa sin límites
     */
    public static async fetchAllFavoriteJobs(): Promise<TrabajosFavoritosInterface> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    data: [],
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/trabajos-favoritos/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: [],
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                };
            }

            return data as TrabajosFavoritosInterface;
        } catch (error) {
            console.error('Error fetching all favorite jobs:', error);
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al cargar los trabajos favoritos'
            };
        }
    }

    /**
     * Filtra los trabajos por estado
     */
    public static filterByStatus(jobs: any[], status: string): any[] {
        if (status === 'all') return jobs;

        // Filtrar según el estado del trabajo (activo/cerrado)
        if (status === 'activo') {
            return jobs.filter(job => job.estado_trabajo === true);
        } else if (status === 'cerrado') {
            return jobs.filter(job => job.estado_trabajo === false);
        }

        return jobs;
    }

    /**
     * Filtra los trabajos por modalidad
     */
    public static filterByModality(jobs: any[], modality: string): any[] {
        if (modality === 'all') return jobs;
        return jobs.filter(job => job.modalidad.toLowerCase() === modality.toLowerCase());
    }

    /**
     * Ordena los trabajos por fecha (más recientes primero)
     */
    public static sortByDate(jobs: any[], descending: boolean = true): any[] {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a.fecha_expiracion).getTime();
            const dateB = new Date(b.fecha_expiracion).getTime();
            return descending ? dateB - dateA : dateA - dateB;
        });
    }

    /**
     * Ordena los trabajos por salario
     */
    public static sortBySalary(jobs: any[], descending: boolean = true): any[] {
        return [...jobs].sort((a, b) => {
            const salaryA = (a.salario_minimo + a.salario_maximo) / 2;
            const salaryB = (b.salario_minimo + b.salario_maximo) / 2;
            return descending ? salaryB - salaryA : salaryA - salaryB;
        });
    }

    /**
     * Elimina un trabajo de favoritos
     * @param idFavorito - El ID del favorito a eliminar (puede ser id_trabajo o id_favorito según backend)
     */
    public static async removeFavorite(idFavorito: number): Promise<{ success: boolean; message: string }> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/favoritos/${idFavorito}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                message: data.message || 'Trabajo removido de favoritos exitosamente'
            };
        } catch (error) {
            console.error('Error removing favorite job:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al quitar el trabajo de favoritos'
            };
        }
    }
}
