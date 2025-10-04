import type { TrabajosAplicadosInterface } from "@/interfaces/trabajosAplicados.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

// Tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase();

/**
 * Servicio para manejar las operaciones relacionadas con los trabajos aplicados
 */
export class AppliedJobsService {

    constructor() { }

    /**
     * Obtiene TODOS los trabajos aplicados por el candidato
     * Este método obtiene la lista completa sin límites
     */
    public static async fetchAllAppliedJobs(): Promise<TrabajosAplicadosInterface> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    data: [],
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/trabajos-aplicados/${user.id}`, {
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

            return data as TrabajosAplicadosInterface;
        } catch (error) {
            console.error('Error fetching all applied jobs:', error);
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al cargar los trabajos aplicados'
            };
        }
    }

    /**
     * Filtra los trabajos por estado
     */
    public static filterByStatus(jobs: any[], status: string): any[] {
        if (status === 'all') return jobs;
        return jobs.filter(job => job.estado_aplicacion.toLowerCase() === status.toLowerCase());
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
}
