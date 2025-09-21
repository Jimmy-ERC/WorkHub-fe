// Login page specific TypeScript
import { AuthHandler } from '../lib/auth.js';

export class LoginPage {
    private authHandler: AuthHandler;
    private loginForm: HTMLFormElement | null = null;

    constructor() {
        this.authHandler = new AuthHandler();
        this.init();
    }

    private init(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupForm();
        });
    }

    private setupForm(): void {
        this.loginForm = document.querySelector('form') as HTMLFormElement;
        
        if (!this.loginForm) {
            console.warn('Login form not found');
            return;
        }

        this.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Add real-time validation
        const emailInput = this.loginForm.querySelector('input[type="email"]') as HTMLInputElement;
        const passwordInput = this.loginForm.querySelector('input[type="password"]') as HTMLInputElement;

        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
        }
    }

    private async handleLogin(): Promise<void> {
        if (!this.loginForm) return;

        const formData = new FormData(this.loginForm);
        const email = formData.get('email') as string || '';
        const password = formData.get('password') as string || '';
        const rememberMe = formData.get('remember') === 'on';

        // Show loading state
        const submitButton = this.loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Iniciando sesión...';
        submitButton.disabled = true;

        try {
            const result = await this.authHandler.login({
                email,
                password,
                rememberMe
            });

            if (result.success) {
                this.showSuccess('Login successful! Redirecting...');
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = '../protected/user/index.html';
                }, 1500);
            } else {
                this.showError(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('An unexpected error occurred');
        } finally {
            // Restore button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    private validateEmail(input: HTMLInputElement): boolean {
        const email = input.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showFieldError(input, 'Email is required');
            return false;
        }
        
        if (!emailPattern.test(email)) {
            this.showFieldError(input, 'Please enter a valid email');
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    private validatePassword(input: HTMLInputElement): boolean {
        const password = input.value;
        
        if (!password) {
            this.showFieldError(input, 'Password is required');
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    private showFieldError(input: HTMLInputElement, message: string): void {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-danger small mt-1';
        errorDiv.textContent = message;
        errorDiv.setAttribute('data-field-error', 'true');
        
        input.parentNode?.insertBefore(errorDiv, input.nextSibling);
        input.classList.add('is-invalid');
    }

    private clearFieldError(input: HTMLInputElement): void {
        const existingError = input.parentNode?.querySelector('[data-field-error]');
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('is-invalid');
    }

    private showSuccess(message: string): void {
        this.showAlert(message, 'success');
    }

    private showError(message: string): void {
        this.showAlert(message, 'danger');
    }

    private showAlert(message: string, type: 'success' | 'danger'): void {
        // Remove existing alerts
        const existingAlert = document.querySelector('.auth-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} auth-alert`;
        alert.textContent = message;
        
        const cardBody = document.querySelector('.login-card');
        if (cardBody) {
            cardBody.insertBefore(alert, cardBody.firstChild);
            
            // Auto-remove success alerts
            if (type === 'success') {
                setTimeout(() => alert.remove(), 3000);
            }
        }
    }
}

// Initialize the login page when this script loads
new LoginPage();