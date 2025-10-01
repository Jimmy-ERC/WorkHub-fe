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

    public static async deleteJobById(jobId: number): Promise<JobsResponse> {
        try {
            const response = await fetch(`${apiUrl}/enterprise/trabajos/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            return {
                success: data.success || false,
                data: data.data || [],
                message: data.message || `Error ${response.status}: ${response.statusText}`
            }
        } catch (error) {
            console.error('Error al eliminar trabajo', error)
            return {
                success: false,
                data: [],
                message: error instanceof Error ? error.message : 'Error desconocido al eliminar trabajo'
            }
        }
    }

}