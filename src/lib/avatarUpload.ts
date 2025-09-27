import { supabase } from "./client";

// Función de diagnóstico para verificar configuración
export async function diagnoseStorageSetup() {
    console.log('=== DIAGNÓSTICO DE STORAGE ===');

    try {
        // 1. Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('1. Usuario autenticado:', user ? `Sí (ID: ${user.id})` : 'No');
        if (authError) console.error('Error de autenticación:', authError);

        // 2. Verificar sesión activa
        const { data: session } = await supabase.auth.getSession();
        console.log('2. Sesión activa:', session.session ? 'Sí' : 'No');

        // 3. Listar buckets disponibles
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('3. Buckets disponibles:', buckets?.map(b => b.name) || 'Error listando buckets');
        if (bucketsError) console.error('Error listando buckets:', bucketsError);

        // 4. Verificar acceso al bucket específico
        const bucketName = 'Archivos_WorkHub';
        if (user) {
            const { error: listError } = await supabase
                .storage
                .from(bucketName)
                .list(user.id, { limit: 1 });

            console.log('4. Acceso al bucket:', listError ? `Error: ${listError.message}` : 'OK');
        }

        console.log('=== FIN DIAGNÓSTICO ===');

    } catch (error) {
        console.error('Error en diagnóstico:', error);
    }
}

export async function uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const bucketName = 'Archivos_WorkHub';
    const ext = file.name.split('.').pop() ?? 'png';
    const filePath = `${user.id}/avatar.${ext}`;

    console.log('Upload attempt:', {
        userId: user.id,
        bucketName,
        filePath,
        fileSize: file.size,
        fileType: file.type
    });

    try {
        // Debug: verificar autenticación
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
            throw new Error('No hay sesión activa');
        }

        // Intentar subir directamente el avatar (sin crear placeholder)
        const { data: uploadData, error: upErr } = await supabase
            .storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type,
                cacheControl: '3600'
            });

        if (upErr) {
            console.error('Upload error details:', upErr);

            // Manejar errores específicos
            if (upErr.message.includes('row-level security policy')) {
                throw new Error(`Las políticas de seguridad del storage no están configuradas correctamente. 
                Necesitas ejecutar las políticas SQL en Supabase. 
                Consulta SUPABASE_STORAGE_POLICIES.md para más información.
                
                Error técnico: ${upErr.message}`);
            } else if (upErr.message.includes('Bucket not found')) {
                throw new Error(`El bucket '${bucketName}' no existe en Supabase Storage.`);
            } else if (upErr.message.includes('not authenticated')) {
                throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
            } else {
                throw new Error(`Error de subida: ${upErr.message}`);
            }
        }

        console.log('Upload successful:', uploadData);

        // Generar URL pública para acceso directo (sin expiración)
        const { data: publicUrl } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicUrl?.publicUrl) {
            throw new Error('No se pudo generar la URL pública del archivo');
        }

        console.log('Public URL created successfully:', publicUrl.publicUrl);
        return publicUrl.publicUrl;

    } catch (error) {
        console.error('Error in uploadAvatar:', error);

        // Re-lanzar el error con información adicional si es necesario
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`Error desconocido en la subida: ${error}`);
        }
    }
}