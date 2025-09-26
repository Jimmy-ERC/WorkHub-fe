import { ProfileEnterpriseService } from '@/services/profileService';
import type { ProfileResponse, ProfileResponseError } from '../../interfaces/profileResponse.interface';
import { sessionManager } from '../../lib/session';

// Variable to track if profile exists (for create vs update logic)
let profileExists = false;

// populacion de los campos del formulario con los datos del perfil
function populateProfileForm(profileData: ProfileResponse['data']) {

    // funcion que asigna valor a un input o textarea si el valor no es null o undefined
    const setInputValue = (id: string, value: string | null | undefined) => {
        const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
        if (element && value !== null && value !== undefined) {
            element.value = value;
        }
    };

    // Populate form fields with profile data
    setInputValue('companyName', profileData.nombre);
    setInputValue('location', profileData.ubicacion);
    setInputValue('about', profileData.biografia);
    setInputValue('phone', profileData.telefono);
    setInputValue('email', profileData.email);
    setInputValue('website', profileData.pagina_web);
    setInputValue('social', profileData.red_social);
    if (profileData.fecha_nacimiento_fundacion) {
        setInputValue('foundedAt', new Date(profileData.fecha_nacimiento_fundacion).toISOString().split('T')[0]); // "2025-09-25T06:00:00.000Z"
    }

}


function showError(message: string) {
    // Create or update error alert
    let errorAlert = document.getElementById('profileErrorAlert');

    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.id = 'profileErrorAlert';
        errorAlert.className = 'alert alert-danger alert-dismissible fade show';
        errorAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <span id="errorMessage">${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert at the top of the main container
        const main = document.querySelector('main.container');
        if (main && main.firstChild) {
            main.insertBefore(errorAlert, main.firstChild);
        }
    } else {
        const errorMessageSpan = errorAlert.querySelector('#errorMessage');
        if (errorMessageSpan) {
            errorMessageSpan.textContent = message;
        }
        errorAlert.classList.add('show');
    }
}

// Function to show success message
function showSuccess(message: string) {
    // Remove any existing alerts
    const existingAlert = document.getElementById('profileErrorAlert') || document.getElementById('profileSuccessAlert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create success alert
    const successAlert = document.createElement('div');
    successAlert.id = 'profileSuccessAlert';
    successAlert.className = 'alert alert-success alert-dismissible fade show';
    successAlert.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insert at the top of the main container
    const main = document.querySelector('main.container');
    if (main && main.firstChild) {
        main.insertBefore(successAlert, main.firstChild);
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (successAlert && successAlert.parentNode) {
            successAlert.remove();
        }
    }, 5000);
}

// Function to collect form data
function collectFormData(): ProfileResponse['data'] {
    const getValue = (id: string): string => {
        const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
        return element ? element.value.trim() : '';
    };

    // Get user ID from session
    const storedUser = sessionManager.getStoredUser();
    const userId = storedUser?.id || '';

    return {
        id_perfil: 0, // Will be set by backend for new profiles
        id_usuario: userId,
        nombre: getValue('companyName'),
        biografia: getValue('about'),
        telefono: getValue('phone'),
        ubicacion: getValue('location'),
        fecha_nacimiento_fundacion: getValue('foundedAt'),
        pagina_web: getValue('website'),
        red_social: getValue('social'),
        email: getValue('email')
    };
}

// Function to clear validation states
function clearValidationStates() {
    const form = document.getElementById('settingsForm');
    if (form) {
        const inputs = form.querySelectorAll('.is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }
}

// Function to set validation states
function setValidationError(fieldId: string) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('is-invalid');
    }
}

// Function to validate form data
function validateFormData(data: ProfileResponse['data']): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Clear previous validation states
    clearValidationStates();

    if (!data.nombre) {
        errors.push('El nombre de la compañía es requerido');
        setValidationError('companyName');
    }

    if (!data.email) {
        errors.push('El email es requerido');
        setValidationError('email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('El formato del email no es válido');
        setValidationError('email');
    }

    if (data.pagina_web && !/^https?:\/\/.+/.test(data.pagina_web)) {
        errors.push('La página web debe ser una URL válida (incluir http:// o https://)');
        setValidationError('website');
    }

    if (data.red_social && !/^https?:\/\/.+/.test(data.red_social)) {
        errors.push('El enlace social debe ser una URL válida (incluir http:// o https://)');
        setValidationError('social');
    }

    if (data.telefono && !/^[\+]?[0-9\s\-\(\)]+$/.test(data.telefono)) {
        errors.push('El formato del teléfono no es válido');
        setValidationError('phone');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Function to handle profile save
async function handleSaveProfile() {
    try {
        // Show loading state
        setLoadingState(true);

        // Collect form data
        const formData = collectFormData();

        // Validate form data
        const validation = validateFormData(formData);
        if (!validation.isValid) {
            showError(validation.errors.join(', '));
            return;
        }

        // Determine if we should create or update
        let result: ProfileResponse | ProfileResponseError;
        
        if (profileExists) {
            // Update existing profile
            result = await ProfileEnterpriseService.updateEnterpriseProfile(formData);
        } else {
            // Create new profile
            result = await ProfileEnterpriseService.createEnterpriseProfile(formData);
        }

        if (!result.success) {
            const errorResult = result as ProfileResponseError;
            showError(errorResult.message);
            return;
        }

        // Success case
        const successResult = result as ProfileResponse;
        const wasCreating = !profileExists;
        profileExists = true; // Now we know the profile exists
        
        // Clear validation states on success
        clearValidationStates();
        
        // Update form with returned data (in case backend modified anything)
        populateProfileForm(successResult.data);
        
        // Update user display name in navbar
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && successResult.data.nombre) {
            userNameDisplay.textContent = successResult.data.nombre;
        }

        // Show success message
        const action = wasCreating ? 'creado' : 'actualizado';
        showSuccess(`Perfil ${action} exitosamente`);

    } catch (error) {
        console.error('Error saving enterprise profile:', error);
        showError('Error inesperado al guardar el perfil. Por favor, intenta nuevamente.');
    } finally {
        setLoadingState(false);
    }
}


function setLoadingState(isLoading: boolean) {
    const form = document.getElementById('settingsForm') as HTMLFormElement;
    const inputs = form?.querySelectorAll('input, textarea, button');

    if (inputs) {
        inputs.forEach(input => {
            (input as HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement).disabled = isLoading;
        });
    }

    // Show/hide loading indicator
    let loadingIndicator = document.getElementById('loadingIndicator');

    if (isLoading && !loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'text-center py-3';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando datos del perfil...</p>
        `;

        const main = document.querySelector('main.container');
        if (main && main.firstChild) {
            main.insertBefore(loadingIndicator, main.firstChild);
        }
    } else if (!isLoading && loadingIndicator) {
        loadingIndicator.remove();
    }
}

async function loadEnterpriseProfile() {
    try {
        // Show loading state
        setLoadingState(true);

        // Fetch profile data
        const result = await ProfileEnterpriseService.fetchEnterpriseProfile();

        if (!result.success) {
            const errorResult = result as ProfileResponseError;
            // Profile doesn't exist, user can create a new one
            profileExists = false;
            showError(errorResult.message);
            return;
        }

        const profileResult = result as ProfileResponse;
        
        // Profile exists, future saves will be updates
        profileExists = true;

        // Populate form with profile data
        populateProfileForm(profileResult.data);

        // Update user display name in navbar if available
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && profileResult.data.nombre) {
            userNameDisplay.textContent = profileResult.data.nombre;
        }

        // Hide loading state
        setLoadingState(false);

    } catch (error) {
        console.error('Error loading enterprise profile:', error);
        profileExists = false;
        showError('Error inesperado al cargar el perfil. Por favor, intenta nuevamente.');
    } finally {
        setLoadingState(false);
    }
}


function initProfileController() {
    const initializeController = () => {
        // Load profile data
        loadEnterpriseProfile();
        
        // Add event listener for save button
        const saveButton = document.querySelector('[data-action="save-profile"]') as HTMLButtonElement;
        if (saveButton) {
            saveButton.addEventListener('click', handleSaveProfile);
        }
    };

    // Load profile data when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeController);
    } else {
        initializeController();
    }
}

// Export functions for potential external use
export {
    populateProfileForm,
    loadEnterpriseProfile,
    handleSaveProfile,
    initProfileController
};

// Initialize the controller
initProfileController();