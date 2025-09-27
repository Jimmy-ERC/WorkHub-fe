import type { ProfileResponse, ProfileResponseError } from "@/interfaces/profileResponse.interface";
import { api } from "@/lib/api";
import sessionManager from "@/lib/session";
import { uploadAvatar } from "@/lib/avatarUpload";

// Base API URL from environment variables
const apiUrl = api.baseUrl

// tomamos el usuario actual de la sesión activa
const { user } = await sessionManager.getUserFromSupabase()

export class ProfileEnterpriseService {

    constructor() { }

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

    // ===================== AVATAR MANAGEMENT FUNCTIONS =====================

    /**
     * Valida un archivo de imagen antes de subirlo
     */
    public static validateImageFile(file: File): { isValid: boolean; error?: string } {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return { isValid: false, error: 'Solo se permiten archivos de imagen' };
        }

        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            return { isValid: false, error: `El archivo es muy grande (${sizeMB}MB). El tamaño máximo es 5MB.` };
        }

        return { isValid: true };
    }

    /**
     * Verifica la conexión con el bucket de Supabase Storage
     */
    public static async verifyBucketConnection(): Promise<boolean> {
        try {
            const { supabase } = await import('@/lib/client');
            const bucketName = 'Archivos_WorkHub';

            // Intentar listar archivos para verificar que el bucket existe y tenemos acceso
            const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 });

            if (error) {
                console.error('Error accessing bucket:', error);
                throw new Error(`No se puede acceder al bucket '${bucketName}': ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('Bucket verification failed:', error);
            throw error;
        }
    }

    /**
     * Lista los buckets disponibles para diagnóstico
     */
    public static async debugBuckets(): Promise<string[]> {
        try {
            const { supabase } = await import('@/lib/client');
            const { data: buckets, error } = await supabase.storage.listBuckets();

            if (error) {
                console.error('Error listing buckets:', error);
                throw error;
            }

            const bucketNames = buckets?.map(b => b.name) || [];
            console.log('Available buckets:', bucketNames);
            return bucketNames;
        } catch (error) {
            console.error('Error in debugBuckets:', error);
            throw error;
        }
    }

    /**
     * Carga el avatar existente del usuario desde Supabase Storage
     */
    public static async loadExistingAvatar(): Promise<string | null> {
        try {
            const storedUser = await sessionManager.getUserFromSupabase();
            console.log('Stored user for avatar load:', storedUser);

            if (!storedUser || !storedUser.user || !storedUser.user.id) {
                console.log('No user found for avatar load');
                return null;
            }

            const { supabase } = await import('@/lib/client');

            // Verificar que el usuario esté autenticado en Supabase
            const { data: { session }, error: authError } = await supabase.auth.getSession();

            if (authError) {
                console.error('Error getting session:', authError);
                return null;
            }

            if (!session) {
                console.log('No active session found for avatar load');
                return null;
            }

            const bucketName = 'Archivos_WorkHub';
            const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

            // Intentar cargar avatar con diferentes extensiones
            for (const ext of extensions) {
                const filePath = `${storedUser.user.id}/avatar.${ext}`;

                try {
                    // Usar URL pública directa (sin expiración)
                    const { data: publicUrl } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    if (publicUrl?.publicUrl) {
                        // Verificar que la URL realmente contenga una imagen válida
                        const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
                        if (response.ok) {
                            console.log(`Avatar found with extension: ${ext}`);
                            return publicUrl.publicUrl;
                        }
                    }
                } catch (extError) {
                    // Continuar con la siguiente extensión
                    continue;
                }
            }

            console.log('No avatar found for user');
            return null;
        } catch (error) {
            console.error('Error loading existing avatar:', error);
            return null;
        }
    }

    /**
     * Sube un avatar para el perfil de empresa
     */
    public static async uploadEnterpriseAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
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

            return {
                success: true,
                avatarUrl
            };

        } catch (error) {
            console.error('Error uploading enterprise avatar:', error);
            
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