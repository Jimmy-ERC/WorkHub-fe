import type { Job } from "@/interfaces/job.interface";
import type { JobsResponse } from "@/interfaces/jobsResponse";
import type { ProfileResponse, ProfileResponseError } from "@/interfaces/profileResponse.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";

// Base API URL from environment variables
const apiUrl = api.baseUrl

// tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase()

export class JobsService {

    constructor() { }

    public static async getJobsByProfileId(profileId: number): Promise<JobsResponse> {
        try {
            const response = await fetch(`${apiUrl}/trabajos/${profileId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json();

            return {
                success: data.success || false,
                data: data.data || [],
                message: data.message || `Error ${response.status}: ${response.statusText}`
            }
        } catch (error) {
            console.error('Error al consultar trabajos', error)
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al consultar trabajos'
            }
        }
    }

    public static async fetchEnterpriseProfile(): Promise<ProfileResponse | ProfileResponseError> {
        try {

            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                } as ProfileResponseError;
            }

            const response = await fetch(`${apiUrl}/enterprise/perfiles/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                } as ProfileResponseError;
            }

            return data as ProfileResponse;
        } catch (error) {
            console.error('Error fetching enterprise profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al cargar el perfil'
            } as ProfileResponseError;
        }
    }

    //funcion para crear el perfil empresarial
    public static async createEnterpriseProfile(profileData: ProfileResponse['data']): Promise<ProfileResponse | ProfileResponseError> {
        try {
            const response = await fetch(`${apiUrl}/enterprise/perfiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                } as ProfileResponseError;
            }

            return data as ProfileResponse;
        } catch (error) {
            console.error('Error creating enterprise profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al crear el perfil'
            } as ProfileResponseError;
        }
    }



    // funcion para actualizar el perfil empresarial
    public static async updateEnterpriseProfile(profileData: ProfileResponse['data']): Promise<ProfileResponse | ProfileResponseError> {
        try {

            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                } as ProfileResponseError;
            }

            const response = await fetch(`${apiUrl}/enterprise/perfiles/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error ${response.status}: ${response.statusText}`
                } as ProfileResponseError;
            }

            return data as ProfileResponse;
        } catch (error) {
            console.error('Error updating enterprise profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al actualizar el perfil'
            } as ProfileResponseError;
        }
    }
}