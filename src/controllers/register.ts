import type { RegisterResult } from '@/interfaces/registerResponse.interface';
import { AuthService, type SignUpData } from '../lib/auth';

export class RegisterPage {
    private authService: AuthService;
    private form: HTMLFormElement | null = null;
    private submitButton: HTMLButtonElement | null = null;

    constructor() {
        this.authService = new AuthService();
        this.init();
    }

    private init(): void {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    private setupEventListeners(): void {
        this.form = document.getElementById('registerForm') as HTMLFormElement;
        this.submitButton = document.getElementById('submitButton') as HTMLButtonElement;

        if (!this.form) {
            console.error('Register form not found');
            return;
        }

        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add real-time validation
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Handle password confirmation validation
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;

        if (passwordInput && confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
            });
        }
    }

    private async handleSubmit(event: Event): Promise<RegisterResult | void> {
        event.preventDefault();

        if (!this.form) return;

        // Get form data
        const formData = new FormData(this.form);
        const signUpData: SignUpData = {
            fullName: formData.get('fullName') as string,
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            userType: formData.get('userType') as string,
            password: formData.get('password') as string,
            confirmPassword: formData.get('confirmPassword') as string
        };

        // Clear previous errors
        this.clearAllErrors();

        // Disable submit button during processing
        this.setLoading(true);

        try {
            // Attempt registration
            const result = await this.authService.signUp(signUpData) as RegisterResult;

            if (result.user.user_metadata.user_type === 'Empresa'){
                // Crear un perfil vacio para la empresa con el ID del usuario registrado
            }


            if (result.success) {
                this.showSuccess(result.message || 'Registration successful! Confirm your email to log in.');

                // If registration is successful and doesn't require email confirmation,
                // redirect to dashboard or login page
                setTimeout(() => {
                    window.location.href = '/public/auth/login.html';
                }, 2500);
            } else {
                this.showError(result.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    private validateField(input: HTMLInputElement): boolean {
        const value = input.value.trim();
        const fieldName = input.name;

        // Clear previous error
        this.clearFieldError(input);

        // Basic validation
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'fullName':
                if (!value) {
                    errorMessage = 'Full name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Full name must be at least 2 characters';
                    isValid = false;
                }
                break;

            case 'username':
                if (!value) {
                    errorMessage = 'Username is required';
                    isValid = false;
                } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
                    errorMessage = 'Username must be 3-20 characters, letters, numbers, and underscores only';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
                    errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and number';
                    isValid = false;
                }
                break;

            case 'confirmPassword':
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                if (!value) {
                    errorMessage = 'Please confirm your password';
                    isValid = false;
                } else if (passwordInput && value !== passwordInput.value) {
                    errorMessage = 'Passwords do not match';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }

        return isValid;
    }

    private validatePasswordMatch(password: string, confirmPassword: string): void {
        const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;

        if (confirmInput && confirmPassword) {
            if (password !== confirmPassword) {
                this.showFieldError(confirmInput, 'Passwords do not match');
            } else {
                this.clearFieldError(confirmInput);
            }
        }
    }

    private showFieldError(input: HTMLInputElement, message: string): void {
        // Add error class to input
        input.classList.add('is-invalid');

        // Create or update error message
        let errorElement = input.parentElement?.querySelector('.invalid-feedback') as HTMLElement;

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            input.parentElement?.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    private clearFieldError(input: HTMLInputElement): void {
        input.classList.remove('is-invalid');
        const errorElement = input.parentElement?.querySelector('.invalid-feedback') as HTMLElement;
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    private clearAllErrors(): void {
        const errorElements = document.querySelectorAll('.alert-danger');
        errorElements.forEach(element => element.remove());

        const inputs = document.querySelectorAll('input.is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const errorElement = input.parentElement?.querySelector('.invalid-feedback') as HTMLElement;
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }

    private showError(message: string): void {
        this.showAlert(message, 'danger');
    }

    private showSuccess(message: string): void {
        this.showAlert(message, 'success');
    }

    private showAlert(message: string, type: 'success' | 'danger'): void {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert alert before the form
        if (this.form) {
            this.form.parentElement?.insertBefore(alertDiv, this.form);
        }

        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }

    private setLoading(loading: boolean): void {
        if (this.submitButton) {
            if (loading) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creando cuenta...
                `;
            } else {
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = 'Crear Cuenta →';
            }
        }

        // Disable all form inputs during loading
        if (this.form) {
            const inputs = this.form.querySelectorAll('input, select');
            inputs.forEach(input => {
                (input as HTMLInputElement).disabled = loading;
            });
        }
    }
}

new RegisterPage();