import { sessionManager } from './session.js';

/**
 * Función utilitaria para cargar y mostrar los datos del usuario desde Supabase
 * Actualiza el nombre de usuario y la imagen de perfil en la navbar
 */
export async function loadUserData(): Promise<void> {
    try {
        const data = await sessionManager.getUserFromSupabase();

        if (!data.success || !data.user) {
            throw new Error(data.message || 'No se pudo obtener la información del usuario');
        }
        const userNameDisplay = document.getElementById('userNameDisplay');

        if (userNameDisplay && data.user?.user_metadata?.full_name) {
            userNameDisplay.textContent = data.user.user_metadata.full_name;

        }


        // Update navbar avatar if exists
        const profilePic = document.getElementById('profilePic') as HTMLImageElement;
        const storedUser = data.user?.user_metadata?.avatar_url;

        // Cargar y mostrar foto de perfil si existe
        if (storedUser && profilePic) {
            profilePic.src = storedUser;
            profilePic.onerror = () => {
                console.log('Error loading profile picture, using default.');
                profilePic.src = '/src/assets/img/avatar.jpg';
            };
        } else if (profilePic) {
            profilePic.src = '/src/assets/img/avatar.jpg'; // Imagen por defecto
            console.log('No profile picture found, using default.');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = 'Usuario';
        }
        // Set default avatar on error
        const profilePic = document.getElementById('profilePic') as HTMLImageElement;
        if (profilePic) {
            profilePic.src = '/src/assets/img/avatar.jpg';
        }
    }
}