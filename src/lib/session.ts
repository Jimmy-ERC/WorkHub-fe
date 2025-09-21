import { supabase } from './client'


export type StoredUser = {
    id: string;
    email?: string | null | undefined;
    nombre?: string | null | undefined;
    usuario?: string | null | undefined;
    userType?: string | null | undefined;
}

// este es el nombre que tendrá la el campo key en el localStorage con el value de los datos del usuario no sensibles
const STORAGE_KEY = 'workhub_session_v1'

export const sessionManager = {
    init() {
        // Listen to Supabase auth state changes and update localStorage accordingly
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session && session.user) {
                const toStore: StoredUser = {
                    id: session.user.id,
                    email: session.user.email,
                    nombre: session.user.user_metadata?.full_name,
                    usuario: session.user.user_metadata?.username,
                    userType: session.user.user_metadata?.user_type,
                }
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
                } catch (e) {
                    console.warn('Could not persist session', e)
                }
            } else {
                try { localStorage.removeItem(STORAGE_KEY) } catch (e) { }
            }
        })
    },

    getStoredUser(): StoredUser | null {
        // obtiene el usuario actual de la sesión almacenada
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return raw ? JSON.parse(raw) as StoredUser : null
        } catch (e) {
            return null
        }
    },

    async getUserFromSupabase() {
        try {
            // esta funcion de supabase envía a través de cookie el token automaticamente para devolver el usuario actual
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                return { success: false, user: null, message: error.message }
            }
            return { success: true, user: data.user }
        } catch (error: any) {
            return { success: false, user: null, message: error.message }
        }
    },

    isAuthenticated(): boolean {
        return !!this.getStoredUser()
    },

    async signOut() {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.log('Error signing out:', error)
        } finally {
            try { localStorage.removeItem(STORAGE_KEY) 
            } catch (e) {
                console.log('Could not clear session', e)
            }
        }
    }
}

sessionManager.init()

export default sessionManager
