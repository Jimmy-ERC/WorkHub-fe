import type { ProfileResponse, ProfileResponseError } from "@/interfaces/profileResponse.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";
import { ProfileEnterpriseService } from "./profileEnterprise.service";
import { uploadAvatar } from "@/lib/avatarUpload";

// Base API URL from environment variables
const apiUrl = api.baseUrl

// tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase()

export class ProfileCandidateService {

    constructor() { }

    /**
     * Obtiene el perfil del candidato por ID de usuario
     */
    public static async fetchCandidateProfile(): Promise<ProfileResponse | ProfileResponseError> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                } as ProfileResponseError;
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/${user.id}`, {
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
            console.error('Error fetching candidate profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al cargar el perfil'
            } as ProfileResponseError;
        }
    }

    /**
     * Crea un nuevo perfil de candidato
     */
    public static async createCandidateProfile(profileData: ProfileResponse['data']): Promise<ProfileResponse | ProfileResponseError> {
        try {
            const response = await fetch(`${apiUrl}/candidate/perfiles`, {
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
            console.error('Error creating candidate profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al crear el perfil'
            } as ProfileResponseError;
        }
    }

    /**
     * Actualiza el perfil de candidato existente
     */
    public static async updateCandidateProfile(profileData: ProfileResponse['data']): Promise<ProfileResponse | ProfileResponseError> {
        try {
            if (!user || !user.id) {
                return {
                    success: false,
                    message: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.'
                } as ProfileResponseError;
            }

            const response = await fetch(`${apiUrl}/candidate/perfiles/${user.id}`, {
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
            console.error('Error updating candidate profile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al actualizar el perfil'
            } as ProfileResponseError;
        }
    }

    // ===================== AVATAR MANAGEMENT FUNCTIONS FOR CANDIDATES =====================

    /**
     * Valida un archivo de imagen antes de subirlo (reutiliza la validación de enterprise)
     */
    public static validateImageFile(file: File): { isValid: boolean; error?: string } {
        return ProfileEnterpriseService.validateImageFile(file);
    }

    /**
     * Verifica la conexión con el bucket de Supabase Storage (reutiliza la función de enterprise)
     */
    public static async verifyBucketConnection(): Promise<boolean> {
        return ProfileEnterpriseService.verifyBucketConnection();
    }

    /**
     * Lista los buckets disponibles para diagnóstico (reutiliza la función de enterprise)
     */
    public static async debugBuckets(): Promise<string[]> {
        return ProfileEnterpriseService.debugBuckets();
    }

    /**
     * Carga el avatar existente del usuario desde Supabase Storage (reutiliza la función de enterprise)
     */
    public static async loadExistingAvatar(): Promise<string | null> {
        return ProfileEnterpriseService.loadExistingAvatar();
    }

    /**
     * Sube un avatar para el perfil de candidato
     */
    public static async uploadCandidateAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
        try {
            // Validar archivo
            const validation = this.validateImageFile(file);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error || 'Archivo no válido'
                };
            }

            // Verificar conexión con bucket
            await this.verifyBucketConnection();

            // Subir avatar
            const avatarUrl = await uploadAvatar(file);

            if (!avatarUrl) {
                return {
                    success: false,
                    error: 'No se pudo obtener la URL del avatar'
                };
            }

            // actualizar el local storage con la nueva URL del avatar
            const STORAGE_KEY = 'workhub_session_v1'

            const storedUser = sessionManager.getStoredUser();
            if (storedUser) {
                storedUser.link_foto_perfil = avatarUrl;
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser));
                } catch (e) {
                    console.warn('Could not update stored user with new avatar URL', e);
                }
            }

            return {
                success: true,
                avatarUrl
            };

        } catch (error) {
            console.error('Error uploading candidate avatar:', error);

            let errorMessage = 'Error desconocido';
            if (error instanceof Error) {
                if (error.message.includes('Bucket not found')) {
                    errorMessage = 'El bucket de almacenamiento no existe. Contacta al administrador.';
                } else if (error.message.includes('No se puede acceder al bucket')) {
                    errorMessage = error.message;
                } else if (error.message.includes('row-level security policy')) {
                    errorMessage = 'Las políticas de seguridad no están configuradas. Consulta la documentación de configuración.';
                } else {
                    errorMessage = error.message;
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }
}