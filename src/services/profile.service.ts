import type { ProfileResponse, ProfileResponseError } from "@/interfaces/profileResponse.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";
import { uploadAvatar } from "@/lib/avatarUpload";

// Base API URL from environment variables
const apiUrl = api.baseUrl

// tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase()

export class ProfileService {

    constructor() { }

    public static async fetchProfile(): Promise<ProfileResponse | ProfileResponseError> {
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

}