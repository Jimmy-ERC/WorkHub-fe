import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import sessionManager from "@/lib/session";
import { diagnoseStorageSetup } from "@/lib/avatarUpload";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileGeneralCandidateService } from "@/services/profileGeneralCandidate.service";
import { loadUserData } from "@/lib/userDataLoader";
import { initCVUpload } from "@/lib/cvUpload";
import { CurriculumService } from "@/services/curriculumService";

// Variable to track if profile exists (for create vs update logic)
let profileExists = false;
let currentProfileId: number | null = null;

// Populación de los campos del formulario con los datos del perfil
function populateProfileForm(profileData: ProfileResponse['data']) {

    // Función que asigna valor a un input, textarea o select si el valor no es null o undefined
    const setInputValue = (id: string, value: string | null | undefined) => {
        const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (element && value !== null && value !== undefined) {
            element.value = value;
        }
    };

    // Populate form fields with profile data
    setInputValue('fullName', profileData.nombre);
    setInputValue('gender', profileData.genero);
    setInputValue('maritalStatus', profileData.estado_civil);
    setInputValue('experience', profileData.experiencia);
    setInputValue('education', profileData.educacion);
    setInputValue('about', profileData.biografia);
    setInputValue('phone', profileData.telefono);
    setInputValue('location', profileData.ubicacion);
    setInputValue('email', profileData.email);
    setInputValue('website', profileData.pagina_web);
    setInputValue('social', profileData.red_social);

    // Para la fecha de nacimiento, convertir al formato requerido por input type="date"
    if (profileData.fecha_nacimiento_fundacion) {
        setInputValue('foundedAt', new Date(profileData.fecha_nacimiento_fundacion).toISOString().split('T')[0]);
    }

    // Cargar avatar si está disponible en el perfil
    if (profileData.link_foto_perfil) {
        updateAvatarPreview(profileData.link_foto_perfil);
    }
}

// Function to show error message
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
        const main = document.querySelector('main.container-fluid');
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
    const main = document.querySelector('main.container-fluid');
    if (main && main.firstChild) {
        main.insertBefore(successAlert, main.firstChild);
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (successAlert && successAlert.parentNode) {
            successAlert.parentNode.removeChild(successAlert);
        }
    }, 5000);
}

/**
 * Actualiza el contador de alertas en el sidebar
 */
async function updateAlertsBadge(): Promise<void> {
    try {
        const response = await ProfileGeneralCandidateService.fetchProfileStats();
        if (response.success && response.data) {
            const alertBadge = document.getElementById('jobAlertsCount');
            if (alertBadge) {
                const alertCount = parseInt(response.data.alertas_trabajo_count);
                alertBadge.textContent = alertCount > 0 ? alertCount.toString().padStart(2, '0') : '00';
            }
        }
    } catch (error) {
        console.error('Error updating alerts badge:', error);
    }
}

// Function to get current avatar URL from the preview
function getCurrentAvatarUrl(): string | undefined {
    const dropArea = document.getElementById('dropArea');
    if (!dropArea) return undefined;

    const img = dropArea.querySelector('img');
    return img?.src || undefined;
}

// Function to collect form data
function collectFormData(): ProfileResponse['data'] {
    const getValue = (id: string): string => {
        const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        return element ? element.value.trim() : '';
    };

    // Get user ID from session
    const storedUser = sessionManager.getStoredUser();
    const userId = storedUser?.id || '';

    return {
        id_perfil: 0, // Will be set by backend for new profiles
        id_usuario: userId,
        nombre: getValue('fullName'),
        biografia: getValue('about'),
        telefono: getValue('phone'),
        ubicacion: getValue('location'),
        fecha_nacimiento_fundacion: getValue('foundedAt'),
        pagina_web: getValue('website'),
        red_social: getValue('social'),
        email: getValue('email'),
        link_foto_perfil: getCurrentAvatarUrl() || '', // Include current avatar URL or empty string
        genero: getValue('gender'),
        estado_civil: getValue('maritalStatus'),
        experiencia: getValue('experience'),
        educacion: getValue('education')
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
        errors.push('El nombre completo es requerido');
        setValidationError('fullName');
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

        let result;
        if (profileExists) {
            // Update existing profile
            result = await ProfileCandidateService.updateCandidateProfile(formData);
        } else {
            // Create new profile
            result = await ProfileCandidateService.createCandidateProfile(formData);
        }

        if (result.success) {
            profileExists = true; // Profile now exists after creation/update
            showSuccess(profileExists ? 'Perfil actualizado exitosamente' : 'Perfil creado exitosamente');

            // Update form with returned data if available
            if ('data' in result && result.data) {
                populateProfileForm(result.data);
            }
        } else {
            showError(result.message);
        }

    } catch (error) {
        console.error('Error saving candidate profile:', error);
        showError(error instanceof Error ? error.message : 'Error desconocido al guardar el perfil');
    } finally {
        setLoadingState(false);
    }
}

// Function to set loading state
function setLoadingState(isLoading: boolean) {
    const form = document.getElementById('settingsForm') as HTMLFormElement;
    const inputs = form?.querySelectorAll('input, textarea, button, select');

    if (inputs) {
        inputs.forEach(input => {
            (input as HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement).disabled = isLoading;
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
            <div class="mt-2">Guardando perfil...</div>
        `;

        const form = document.getElementById('settingsForm');
        if (form) {
            form.appendChild(loadingIndicator);
        }
    } else if (!isLoading && loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Function to load candidate profile
async function loadCandidateProfile() {
    try {
        setLoadingState(true);

        const result = await ProfileCandidateService.fetchCandidateProfile();

        if (result.success && 'data' in result) {
            // Profile exists, populate form
            profileExists = true;
            currentProfileId = result.data.id_perfil;
            populateProfileForm(result.data);

            // Load CVs after profile is loaded
            await loadCandidateCVs(result.data.id_perfil);
        } else {
            // Profile doesn't exist or error occurred
            profileExists = false;
            currentProfileId = null;
            if (result.message && !result.message.includes('404') && !result.message.includes('no encontrado')) {
                // Only show error if it's not a "profile not found" error
                console.warn('Profile not found or error loading:', result.message);
            }
        }

        // Load existing avatar UI
        await loadExistingAvatarUI();

    } catch (error) {
        console.error('Error loading candidate profile:', error);
        profileExists = false;
        currentProfileId = null;
        showError(error instanceof Error ? error.message : 'Error desconocido al cargar el perfil');
    } finally {
        setLoadingState(false);
    }
}

// ==================== CV Management Functions ====================

/**
 * Load candidate CVs
 */
async function loadCandidateCVs(idPerfil: number) {
    try {
        const result = await CurriculumService.fetchCurriculums(idPerfil);

        if (result.success && 'data' in result) {
            const { renderCVList } = await import('@/lib/cvUpload');
            renderCVList(result.data);
        } else {
            const { renderCVList } = await import('@/lib/cvUpload');
            renderCVList([]);
        }
    } catch (error) {
        console.error('Error loading CVs:', error);
        const { renderCVList } = await import('@/lib/cvUpload');
        renderCVList([]);
    }
}

// ==================== Avatar Helper Functions ====================

async function loadExistingAvatarUI() {
    try {
        const avatarUrl = await ProfileCandidateService.loadExistingAvatar();
        if (avatarUrl) {
            updateAvatarPreview(avatarUrl);
        }
    } catch (error) {
        console.error('Error loading existing avatar UI:', error);
    }
}

function updateAvatarPreview(imageUrl: string) {
    const dropArea = document.getElementById('dropArea');
    if (!dropArea) return;

    // Update dropzone to show preview
    dropArea.innerHTML = `
        <div class="position-relative w-100">
            <img src="${imageUrl}" alt="Vista previa del avatar" class="img-fluid rounded" style="max-height: 400px; width: 100%; object-fit: cover;">
            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded opacity-0 hover-overlay">
                <i class="bi bi-camera-fill text-white fs-4"></i>
            </div>
        </div>
        <div class="mt-2">
            <small class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Imagen cargada</small>
        </div>
    `;
}

function resetAvatarDropzone() {
    const dropArea = document.getElementById('dropArea');
    if (!dropArea) return;

    dropArea.innerHTML = `
        <i class="bi bi-cloud-arrow-up fs-1 mb-2 text-primary" aria-hidden="true"></i>
        <div class="fw-medium">Explorar foto</div>
        <small class="text-muted">o suéltala aquí</small>
        <div class="text-muted small mt-2" id="photoHelp">
            Una imagen mayor a 400px funciona mejor. Tamaño máx. 5&nbsp;MB.
        </div>
    `;
}

async function handleAvatarUpload(file: File) {
    try {
        // Show loading state for avatar upload
        const dropArea = document.getElementById('dropArea');
        if (dropArea) {
            dropArea.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status">
                        <span class="visually-hidden">Subiendo...</span>
                    </div>
                    <div class="small text-muted">Subiendo imagen...</div>
                </div>
            `;
        }

        const result = await ProfileCandidateService.uploadCandidateAvatar(file);

        if (result.success && result.avatarUrl) {
            updateAvatarPreview(result.avatarUrl);
            showSuccess('Avatar subido exitosamente');
        } else {
            resetAvatarDropzone();
            showError(result.error || 'Error al subir el avatar');
        }

    } catch (error) {
        console.error('Error handling avatar upload:', error);
        resetAvatarDropzone();
        showError(error instanceof Error ? error.message : 'Error desconocido al subir el avatar');
    }
}

function initAvatarUpload() {
    const fileInput = document.getElementById('profilePhoto') as HTMLInputElement;
    const dropArea = document.getElementById('dropArea');

    if (!fileInput || !dropArea) return;

    // Debug: Log available buckets (useful for troubleshooting)
    ProfileCandidateService.debugBuckets().catch(console.error);

    // Debug: Diagnosticar configuración de storage
    diagnoseStorageSetup();

    // Handle file input change
    fileInput.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            handleAvatarUpload(target.files[0]);
        }
    });

    // Handle drag and drop
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('dragover');

        const files = event.dataTransfer?.files;
        if (files && files[0]) {
            handleAvatarUpload(files[0]);
        }
    });

    // Handle keyboard navigation
    dropArea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });
}

// Main initialization function
function initProfileController() {
    const initializeController = async () => {
        // Load user data for navbar
        await loadUserData();

        // Initialize avatar upload functionality
        initAvatarUpload();

        // Initialize CV upload functionality after profile loads
        // This will be triggered in loadCandidateProfile after we have the profile ID

        // Add event listener for save profile button
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

    // Load candidate profile data (this will also load CVs)
    loadCandidateProfile().then(() => {
        // Initialize CV upload after profile is loaded
        if (currentProfileId) {
            initCVUpload(currentProfileId);
        }
    });

    // Update alerts badge in sidebar
    updateAlertsBadge();
}

// Export functions for potential external use
export {
    populateProfileForm,
    loadCandidateProfile,
    handleSaveProfile,
    initProfileController,
    handleAvatarUpload,
    loadExistingAvatarUI
};

// Initialize the controller
initProfileController();
