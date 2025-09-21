// Authentication handling with Supabase
import { supabase } from './client'
import { FormValidator, ValidationPatterns, type FormField } from './validation';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface SignUpData {
    fullName: string;
    username: string;
    email: string;
    userType: string;
    password: string;
    confirmPassword: string;
}

// Interfaz para respuestas de autenticación
export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: any;
    session?: any;
}

export class AuthService {
    /**
     * Inicia sesión con email y contraseña usando Supabase
     */
    public async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Validar formulario de inicio de sesión
            const fields: FormField[] = [
                {
                    name: 'email',
                    value: credentials.email,
                    rules: [
                        { required: true, message: 'Email is required' },
                        { pattern: ValidationPatterns.email, message: 'Please enter a valid email' }
                    ]
                },
                {
                    name: 'password',
                    value: credentials.password,
                    rules: [{ required: true, message: 'Password is required' }]
                }
            ];

            const validation = FormValidator.validateForm(fields);
            if (!validation.isValid) {
                const errors = validation.errors as Record<string, string[]>;
                const firstError = Object.values(errors)[0]?.[0];
                return { success: false, message: firstError || 'Validation error' };
            }

            // Llamada a Supabase para iniciar sesión
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            if (error) {
                console.error('Error de inicio de sesión:', error.message);
                return { success: false, message: error.message };
            }

            return {
                success: true,
                message: 'Login successful',
                user: data.user,
                session: data.session
            };

        } catch (error: any) {
            console.error('Error de inicio de sesión:', error);
            return { success: false, message: error.message || 'An error occurred during login' };
        }
    }

    /**
     * Registra un nuevo usuario usando Supabase
     */
    public async signUp(data: SignUpData): Promise<AuthResponse> {
        try {
            // Validar formulario de registro
            const fields: FormField[] = [
                {
                    name: 'fullName',
                    value: data.fullName,
                    rules: [
                        { required: true, message: 'Full name is required' },
                        { minLength: 2, message: 'Full name must be at least 2 characters' }
                    ]
                },
                {
                    name: 'username',
                    value: data.username,
                    rules: [
                        { required: true, message: 'Username is required' },
                        { pattern: ValidationPatterns.username, message: 'Username must be 3-20 characters, letters, numbers, and underscores only' }
                    ]
                },
                {
                    name: 'email',
                    value: data.email,
                    rules: [
                        { required: true, message: 'Email is required' },
                        { pattern: ValidationPatterns.email, message: 'Please enter a valid email' }
                    ]
                },
                {
                    name: 'password',
                    value: data.password,
                    rules: [
                        { required: true, message: 'Password is required' },
                        { pattern: ValidationPatterns.password, message: 'Password must be at least 8 characters with uppercase, lowercase, and number' }
                    ]
                }
            ];

            // Verificar confirmación de contraseña
            if (data.password !== data.confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }

            const validation = FormValidator.validateForm(fields);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0]?.[0];
                return { success: false, message: firstError || 'Validation error' };
            }

            // Llamada a Supabase para registrar usuario
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        username: data.username,
                        user_type: data.userType
                    }
                }
            });

            if (error) {
                console.error('Error de registro:', error.message);
                return { success: false, message: error.message };
            }

            // Verificar si se requiere confirmación por email
            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                return {
                    success: true,
                    message: 'Registration successful. Please check your email to confirm your account.'
                };
            }

            return {
                success: true,
                message: 'Registration successful',
                user: authData.user,
                session: authData.session
            };

        } catch (error: any) {
            console.error('Error de registro:', error);
            return { success: false, message: error.message || 'An error occurred during signup' };
        }
    }

    /**
     * Cierra sesión del usuario actual
     */
    public async signOut(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Logout successful' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error during sign out' };
        }
    }

    /**
     * Obtiene el usuario actualmente autenticado
     */
    public async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                return { success: false, user: null, message: error.message };
            }

            return { success: true, user: data.user };
        } catch (error: any) {
            return { success: false, user: null, message: error.message };
        }
    }

    /**
     * Solicita restablecer contraseña
     */
    public async resetPassword(email: string): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Password reset email sent' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error sending reset password email' };
        }
    }

    /**
     * Actualiza los datos del usuario
     */
    public async updateUserProfile(userData: Record<string, any>): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: userData
            });

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Profile updated successfully', user: data.user };
        } catch (error: any) {
            return { success: false, message: error.message || 'Error updating profile' };
        }
    }

    /**
     * Configura un listener para cambios en la autenticación
     */
    public onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange((event: string, session: any) => {
            callback(event, session);
        });
    }
}