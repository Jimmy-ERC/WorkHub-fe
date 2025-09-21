import { AuthService, type LoginCredentials } from '../lib/auth';

export class LoginPage {
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
        this.form = document.getElementById('loginForm') as HTMLFormElement;
        this.submitButton = document.getElementById('submitButton') as HTMLButtonElement;

        if (!this.form) {
            console.error('Login form not found');
            return;
        }

        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add real-time validation
        const inputs = this.form.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input as HTMLInputElement));
            input.addEventListener('input', () => this.clearFieldError(input as HTMLInputElement));
        });
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        if (!this.form) return;

        const formData = new FormData(this.form);
        const loginData: LoginCredentials = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        };

        this.clearAllErrors();

        if (!this.validateForm()) {
            return;
        }

        this.setLoading(true);

        try {
            const result = await this.authService.login(loginData);

            if (result.success) {
                // console.log('Login successful:', result);
                this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

                if (result.user.user_metadata?.user_type === 'Empresa') {
                    setTimeout(() => {
                        window.location.href = '../enterprise/home.html';
                    }, 1500);
                    return;
                }
                else if (result.user.user_metadata?.user_type === 'Candidato') {
                    setTimeout(() => {
                        window.location.href = '../candidate/home.html';
                    }, 1500);
                }

            } else {
                this.showError(result.message || 'Error al iniciar sesión');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            this.showError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    private validateForm(): boolean {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        let isValid = true;

        if (emailInput && !this.validateField(emailInput)) {
            isValid = false;
        }

        if (passwordInput && !this.validateField(passwordInput)) {
            isValid = false;
        }

        return isValid;
    }

    private validateField(input: HTMLInputElement): boolean {
        const value = input.value.trim();
        const fieldType = input.type;

        // Clear previous error
        this.clearFieldError(input);

        let isValid = true;
        let errorMessage = '';

        switch (fieldType) {
            case 'email':
                if (!value) {
                    errorMessage = 'El correo es requerido';
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Por favor ingresa un correo válido';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'La contraseña es requerida';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }

        return isValid;
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

        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
    }

    private setLoading(loading: boolean): void {
        if (this.submitButton) {
            if (loading) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando sesión...
                `;
            } else {
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = 'Iniciar Sesión →';
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

// Initialize the login page when this script is loaded
new LoginPage();