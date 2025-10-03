import type { TrabajosAplicadosInterface } from "@/interfaces/trabajosAplicados.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

// tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase();

export class ProfileGeneralCandidateService {

    constructor() { }

    /**
     * Obtiene la lista de trabajos aplicados recientemente por el candidato
     */
    public static async fetchRecentlyAppliedJobs(): Promise<TrabajosAplicadosInterface> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    data: [],
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                };
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/general/${user.id}`, {
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
            console.error('Error fetching recently applied jobs:', error);
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al cargar los trabajos aplicados'
            };
        }
    }
}
