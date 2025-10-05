import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";
import { supabase } from "./client";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";

// Función de diagnóstico para verificar configuración
export async function diagnoseStorageSetup() {
  console.log("=== DIAGNÓSTICO DE STORAGE ===");

  try {
    // 1. Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("1. Usuario autenticado:", user ? `Sí (ID: ${user.id})` : "No");
    if (authError) console.error("Error de autenticación:", authError);

    // 2. Verificar sesión activa
    const { data: session } = await supabase.auth.getSession();
    console.log("2. Sesión activa:", session.session ? "Sí" : "No");

    // 3. Listar buckets disponibles
    // const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    // console.log('3. Buckets disponibles:', buckets?.map(b => b.name) || 'Error listando buckets');
    // if (bucketsError) console.error('Error listando buckets:', bucketsError);

    // 4. Verificar acceso al bucket específico
    const bucketName = "Archivos_WorkHub";
    if (user) {
      const { error: listError } = await supabase.storage
        .from(bucketName)
        .list(user.id, { limit: 1 });

      console.log(
        "4. Acceso al bucket:",
        listError ? `Error: ${listError.message}` : "OK"
      );
    }

    console.log("=== FIN DIAGNÓSTICO ===");
  } catch (error) {
    console.error("Error en diagnóstico:", error);
  }
}

export async function uploadAvatar(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const bucketName = "Archivos_WorkHub";
  const ext = file.name.split(".").pop() ?? "png";
  const filePath = `${user.id}/avatar.${ext}`;

  console.log("Upload attempt:", {
    userId: user.id,
    bucketName,
    filePath,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    // Debug: verificar autenticación
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("No hay sesión activa");
    }

    // Intentar subir directamente el avatar (sin crear placeholder)
    const { data: uploadData, error: upErr } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (upErr) {
      console.error("Upload error details:", upErr);

      // Manejar errores específicos
      if (upErr.message.includes("row-level security policy")) {
        throw new Error(`Error técnico: ${upErr.message}`);
      } else if (upErr.message.includes("Bucket not found")) {
        throw new Error(
          `El bucket '${bucketName}' no existe en Supabase Storage.`
        );
      } else if (upErr.message.includes("not authenticated")) {
        throw new Error(
          "Usuario no autenticado. Por favor, inicia sesión nuevamente."
        );
      } else {
        throw new Error(`Error de subida: ${upErr.message}`);
      }
    }

    console.log("Upload successful:", uploadData);

    // Generar URL pública para acceso directo (sin expiración)
    const { data: publicUrl } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrl?.publicUrl) {
      throw new Error("No se pudo generar la URL pública del archivo");
    }

    console.log("Public URL created successfully:", publicUrl.publicUrl);

    // actualizar el app_data del usuario en supabase auth con la nueva URL del avatar
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl.publicUrl },
      });
      if (updateError) {
        console.error(
          "Error updating user app_data with avatar URL:",
          updateError
        );
      } else {
        console.log("User app_data updated with new avatar URL");
      }
    } catch (updateEx) {
      console.error(
        "Exception updating user app_data with avatar URL:",
        updateEx
      );
    }

    // actualizar el perfil del usuario en la tabla "profiles" con la nueva URL del avatar
    try {
      // Importar el servicio dinámicamente para evitar dependencias circulares

      // Obtener el perfil actual
      const currentProfile =
        await ProfileEnterpriseService.fetchEnterpriseProfile();

      if (currentProfile.success) {
        // Cast del tipo para acceder a la propiedad data
        const profileData = currentProfile as ProfileResponse;

        // Actualizar el perfil con la nueva URL del avatar
        const updatedProfileData = {
          ...profileData.data,
          link_foto_perfil: publicUrl.publicUrl,
        };

        const updateResult =
          await ProfileEnterpriseService.updateEnterpriseProfile(
            updatedProfileData
          );

        if (updateResult.success) {
          console.log("Profile updated successfully with new avatar URL");
        } else {
          console.error(
            "Error updating profile with avatar URL:",
            updateResult.message
          );
        }
      } else {
        console.log(
          "No existing profile found, avatar URL will be set when profile is created"
        );
      }
    } catch (profileUpdateError) {
      console.error(
        "Exception updating profile with avatar URL:",
        profileUpdateError
      );
    }

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);

    // Re-lanzar el error con información adicional si es necesario
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error desconocido en la subida: ${error}`);
    }
  }
}
