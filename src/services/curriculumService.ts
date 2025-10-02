import type { Curriculum, CurriculumResponse, CurriculumResponseError, CurriculumUploadResult } from "@/interfaces/curriculum.interface";
import { api } from "@/lib/api";
import { supabase } from "@/lib/client";

const apiUrl = api.baseUrl;

export class CurriculumService {

    /**
     * Obtiene todos los CVs de un candidato por su ID de perfil
     */
    public static async fetchCurriculums(idPerfil: number): Promise<CurriculumResponse | CurriculumResponseError> {
        try {
            const response = await fetch(`${apiUrl}/candidate/curriculums/perfil/${idPerfil}`, {
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
                } as CurriculumResponseError;
            }

            return data as CurriculumResponse;
        } catch (error) {
            console.error('Error fetching curriculums:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al cargar los CVs'
            } as CurriculumResponseError;
        }
    }

    /**
     * Crea un nuevo registro de CV en la base de datos
     */
    public static async createCurriculum(curriculumData: Omit<Curriculum, 'id_curriculum' | 'fecha_subida'>): Promise<CurriculumUploadResult> {
        try {
            const response = await fetch(`${apiUrl}/candidate/curriculums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(curriculumData),
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
                message: data.message || 'CV creado exitosamente'
            };
        } catch (error) {
            console.error('Error creating curriculum:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al crear el CV'
            };
        }
    }

    /**
     * Actualiza el nombre de un CV
     */
    public static async updateCurriculumName(idCurriculum: number, nuevoNombre: string): Promise<CurriculumUploadResult> {
        try {
            const response = await fetch(`${apiUrl}/candidate/curriculums/${idCurriculum}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre_archivo: nuevoNombre }),
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
                message: data.message || 'Nombre actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error updating curriculum name:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al actualizar el nombre'
            };
        }
    }

    /**
     * Elimina un CV (tanto del storage como de la base de datos)
     */
    public static async deleteCurriculum(idCurriculum: number, urlCurriculum: string): Promise<CurriculumUploadResult> {
        try {
            // Primero eliminar el archivo del storage
            const deleteStorageResult = await this.deleteFromStorage(urlCurriculum);
            if (!deleteStorageResult.success) {
                console.warn('Warning: Could not delete file from storage:', deleteStorageResult.message);
                // Continuar con la eliminación de la BD de todas formas
            }

            // Luego eliminar el registro de la base de datos
            const response = await fetch(`${apiUrl}/candidate/curriculums/${idCurriculum}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                message: data.message || 'CV eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error deleting curriculum:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al eliminar el CV'
            };
        }
    }

    /**
     * Sube un archivo de CV al storage de Supabase
     */
    public static async uploadCurriculumFile(file: File): Promise<{ success: boolean; url?: string; message: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    message: 'No autenticado'
                };
            }

            // Validar el archivo
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message || 'Archivo no válido'
                };
            }

            const bucketName = 'Archivos_WorkHub';
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${user.id}/cvs/cv-${timestamp}-${sanitizedFileName}`;

            console.log('Uploading CV:', {
                userId: user.id,
                bucketName,
                filePath,
                fileSize: file.size,
                fileType: file.type
            });

            // Subir el archivo
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from(bucketName)
                .upload(filePath, file, {
                    upsert: false, // No sobrescribir, cada CV es único
                    contentType: file.type,
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(`Error al subir el archivo: ${uploadError.message}`);
            }

            console.log('Upload successful:', uploadData);

            // Generar URL pública
            const { data: publicUrl } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (!publicUrl?.publicUrl) {
                throw new Error('No se pudo generar la URL pública del archivo');
            }

            console.log('Public URL created:', publicUrl.publicUrl);

            return {
                success: true,
                url: publicUrl.publicUrl,
                message: 'Archivo subido exitosamente'
            };

        } catch (error) {
            console.error('Error in uploadCurriculumFile:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al subir el archivo'
            };
        }
    }

    /**
     * Elimina un archivo del storage de Supabase
     */
    private static async deleteFromStorage(fileUrl: string): Promise<{ success: boolean; message: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    message: 'No autenticado'
                };
            }

            // Extraer el path del archivo de la URL
            const bucketName = 'Archivos_WorkHub';
            const urlObj = new URL(fileUrl);
            const pathParts = urlObj.pathname.split(`/${bucketName}/`);

            if (pathParts.length < 2 || !pathParts[1]) {
                return {
                    success: false,
                    message: 'URL de archivo inválida'
                };
            }

            const filePath = decodeURIComponent(pathParts[1]);

            console.log('Deleting file from storage:', filePath);

            const { error: deleteError } = await supabase
                .storage
                .from(bucketName)
                .remove([filePath]);

            if (deleteError) {
                console.error('Delete error:', deleteError);
                return {
                    success: false,
                    message: deleteError.message
                };
            }

            return {
                success: true,
                message: 'Archivo eliminado del storage'
            };

        } catch (error) {
            console.error('Error in deleteFromStorage:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al eliminar del storage'
            };
        }
    }

    /**
     * Valida que el archivo sea del tipo y tamaño correcto
     */
    private static validateFile(file: File): { valid: boolean; message?: string } {
        // Validar tipo de archivo
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword' // .doc
        ];

        const allowedExtensions = ['pdf', 'docx', 'doc'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
            return {
                valid: false,
                message: 'Solo se permiten archivos PDF, DOC o DOCX'
            };
        }

        // Validar tamaño (30 MB = 30 * 1024 * 1024 bytes)
        const maxSize = 30 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                valid: false,
                message: 'El archivo no debe superar los 30 MB'
            };
        }

        if (file.size === 0) {
            return {
                valid: false,
                message: 'El archivo está vacío'
            };
        }

        return { valid: true };
    }

    /**
     * Formatea el tamaño del archivo para mostrar
     */
    public static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * Obtiene la extensión del archivo de una URL
     */
    public static getFileExtension(url: string): string {
        const pathname = new URL(url).pathname;
        const extension = pathname.split('.').pop()?.toLowerCase();
        return extension || 'file';
    }
}
