// Authentication handling
import { FormValidator, ValidationPatterns, type FormField } from './validation.js';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface SignUpData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export class AuthHandler {
    private baseURL: string = '/api/auth'; // Adjust based on your backend

    public async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> {
        try {
            // Validate login form
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
                const firstError = Object.values(validation.errors)[0]?.[0];
                return { success: false, message: firstError || 'Validation error' };
            }

            // Here you would make the actual API call
            console.log('Attempting login with:', { email: credentials.email });
            
            // Simulate API call
            await this.delay(1000);
            
            // For now, just simulate success
            return { success: true, message: 'Login successful' };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    }

    public async signUp(data: SignUpData): Promise<{ success: boolean; message?: string }> {
        try {
            // Validate signup form
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

            // Check password confirmation
            if (data.password !== data.confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }

            const validation = FormValidator.validateForm(fields);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0]?.[0];
                return { success: false, message: firstError || 'Validation error' };
            }

            // Here you would make the actual API call
            console.log('Attempting signup with:', { 
                fullName: data.fullName, 
                username: data.username, 
                email: data.email 
            });
            
            // Simulate API call
            await this.delay(1000);
            
            return { success: true, message: 'Account created successfully' };

        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'An error occurred during signup' };
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}