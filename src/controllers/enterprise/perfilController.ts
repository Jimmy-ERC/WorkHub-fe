import { ProfileEnterpriseService } from "@/services/profileEnterprise.service.js";
import type {
  ProfileResponse,
  ProfileResponseError,
} from "../../interfaces/profileResponse.interface";
import { sessionManager } from "../../lib/session";
import { diagnoseStorageSetup } from "../../lib/avatarUpload";
import { loadUserData } from "../../lib/userDataLoader.js";

// Variable to track if profile exists (for create vs update logic)
let profileExists = false;

// populacion de los campos del formulario con los datos del perfil
function populateProfileForm(profileData: ProfileResponse["data"]) {
  // funcion que asigna valor a un input o textarea si el valor no es null o undefined
  const setInputValue = (id: string, value: string | null | undefined) => {
    const element = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (element && value !== null && value !== undefined) {
      element.value = value;
    }
  };

  // Populate form fields with profile data
  setInputValue("companyName", profileData.nombre);
  setInputValue("location", profileData.ubicacion);
  setInputValue("about", profileData.biografia);
  setInputValue("phone", profileData.telefono);
  setInputValue("email", profileData.email);
  setInputValue("website", profileData.pagina_web);
  setInputValue("social", profileData.red_social);
  if (profileData.fecha_nacimiento_fundacion) {
    setInputValue(
      "foundedAt",
      new Date(profileData.fecha_nacimiento_fundacion)
        .toISOString()
        .split("T")[0]
    ); // "2025-09-25T06:00:00.000Z"
  }

  // Cargar avatar si está disponible en el perfil
  if (profileData.link_foto_perfil) {
    updateAvatarPreview(profileData.link_foto_perfil);
  }
}

function showError(message: string) {
  // Create or update error alert
  let errorAlert = document.getElementById("profileErrorAlert");

  if (!errorAlert) {
    errorAlert = document.createElement("div");
    errorAlert.id = "profileErrorAlert";
    errorAlert.className = "alert alert-danger alert-dismissible fade show";
    errorAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <span id="errorMessage">${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Insert at the top of the main container
    const main = document.querySelector("main.container");
    if (main && main.firstChild) {
      main.insertBefore(errorAlert, main.firstChild);
    }
  } else {
    const errorMessageSpan = errorAlert.querySelector("#errorMessage");
    if (errorMessageSpan) {
      errorMessageSpan.textContent = message;
    }
    errorAlert.classList.add("show");
  }
}

// Function to show success message
function showSuccess(message: string) {
  // Remove any existing alerts
  const existingAlert =
    document.getElementById("profileErrorAlert") ||
    document.getElementById("profileSuccessAlert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create success alert
  const successAlert = document.createElement("div");
  successAlert.id = "profileSuccessAlert";
  successAlert.className = "alert alert-success alert-dismissible fade show";
  successAlert.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  // Insert at the top of the main container
  const main = document.querySelector("main.container");
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

// Function to get current avatar URL from the preview
function getCurrentAvatarUrl(): string | undefined {
  const dropArea = document.getElementById("dropArea");
  if (!dropArea) return undefined;

  const img = dropArea.querySelector("img");
  return img?.src || undefined;
}

// Function to collect form data
function collectFormData(): ProfileResponse["data"] {
  const getValue = (id: string): string => {
    const element = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    return element ? element.value.trim() : "";
  };

  // Get user ID from session
  const storedUser = sessionManager.getStoredUser();
  const userId = storedUser?.id || "";

  return {
    id_perfil: 0, // Will be set by backend for new profiles
    id_usuario: userId,
    nombre: getValue("companyName"),
    biografia: getValue("about"),
    telefono: getValue("phone"),
    ubicacion: getValue("location"),
    fecha_nacimiento_fundacion: getValue("foundedAt"),
    pagina_web: getValue("website"),
    red_social: getValue("social"),
    email: getValue("email"),
    link_foto_perfil: getCurrentAvatarUrl() || "", // Include current avatar URL or empty string
  };
}

// Function to clear validation states
function clearValidationStates() {
  const form = document.getElementById("settingsForm");
  if (form) {
    const inputs = form.querySelectorAll(".is-invalid");
    inputs.forEach((input) => {
      input.classList.remove("is-invalid");
    });
  }
}

// Function to set validation states
function setValidationError(fieldId: string) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add("is-invalid");
  }
}

// Function to validate form data
function validateFormData(data: ProfileResponse["data"]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Clear previous validation states
  clearValidationStates();

  if (!data.nombre) {
    errors.push("El nombre de la compañía es requerido");
    setValidationError("companyName");
  }

  if (!data.email) {
    errors.push("El email es requerido");
    setValidationError("email");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("El formato del email no es válido");
    setValidationError("email");
  }

  if (data.pagina_web && !/^https?:\/\/.+/.test(data.pagina_web)) {
    errors.push(
      "La página web debe ser una URL válida (incluir http:// o https://)"
    );
    setValidationError("website");
  }

  if (data.red_social && !/^https?:\/\/.+/.test(data.red_social)) {
    errors.push(
      "El enlace social debe ser una URL válida (incluir http:// o https://)"
    );
    setValidationError("social");
  }

  if (data.telefono && !/^[\+]?[0-9\s\-\(\)]+$/.test(data.telefono)) {
    errors.push("El formato del teléfono no es válido");
    setValidationError("phone");
  }

  return {
    isValid: errors.length === 0,
    errors,
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
      showError(validation.errors.join(", "));
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

    // Update user display and profile pic name in navbar

    loadUserData();

    // Show success message
    const action = wasCreating ? "creado" : "actualizado";
    showSuccess(`Perfil ${action} exitosamente`);
  } catch (error) {
    console.error("Error saving enterprise profile:", error);
    showError(
      "Error inesperado al guardar el perfil. Por favor, intenta nuevamente."
    );
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading: boolean) {
  const form = document.getElementById("settingsForm") as HTMLFormElement;
  const inputs = form?.querySelectorAll("input, textarea, button");

  if (inputs) {
    inputs.forEach((input) => {
      (
        input as HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement
      ).disabled = isLoading;
    });
  }

  // Show/hide loading indicator
  let loadingIndicator = document.getElementById("loadingIndicator");

  if (isLoading && !loadingIndicator) {
    loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loadingIndicator";
    loadingIndicator.className = "text-center py-3";
    loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando datos del perfil...</p>
        `;

    const main = document.querySelector("main.container");
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

      // Still try to load existing avatar even if profile doesn't exist
      await loadExistingAvatarUI();
      showError(errorResult.message);
      return;
    }

    const profileResult = result as ProfileResponse;

    // Profile exists, future saves will be updates
    profileExists = true;

    // Populate form with profile data
    populateProfileForm(profileResult.data);

    // Load existing avatar
    await loadExistingAvatarUI();

    // Update user display name in navbar if available
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay && profileResult.data.nombre) {
      userNameDisplay.textContent = profileResult.data.nombre;
    }

    loadUserData();

    // Hide loading state
    setLoadingState(false);
  } catch (error) {
    console.error("Error loading enterprise profile:", error);
    profileExists = false;
    showError(
      "Error inesperado al cargar el perfil. Por favor, intenta nuevamente."
    );
  } finally {
    setLoadingState(false);
  }
}

// ==================== Avatar Helper Functions ====================

async function loadExistingAvatarUI() {
  try {
    const avatarUrl = await ProfileEnterpriseService.loadExistingAvatar();
    if (avatarUrl) {
      updateAvatarPreview(avatarUrl);
    }
  } catch (error) {
    console.error("Error loading existing avatar UI:", error);
  }
}

function updateAvatarPreview(imageUrl: string) {
  const dropArea = document.getElementById("dropArea");
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
  const dropArea = document.getElementById("dropArea");
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
    // Show loading state on dropzone
    const dropArea = document.getElementById("dropArea");
    if (dropArea) {
      dropArea.innerHTML = `
                <div class="spinner-border text-primary mb-2" role="status">
                    <span class="visually-hidden">Subiendo...</span>
                </div>
                <div class="fw-medium">Subiendo imagen...</div>
                <small class="text-muted">Por favor espera</small>
            `;
    }

    // Use service to upload avatar
    const result = await ProfileEnterpriseService.uploadEnterpriseAvatar(file);

    if (!result.success) {
      throw new Error(result.error || "Error desconocido al subir avatar");
    }

    if (!result.avatarUrl) {
      throw new Error("No se pudo obtener la URL del avatar");
    }

    // Update preview
    updateAvatarPreview(result.avatarUrl);

    // Show success message
    showSuccess("Avatar subido exitosamente");
  } catch (error) {
    console.error("Error uploading avatar:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    showError(`Error al subir el avatar: ${errorMessage}`);

    // Reset dropzone on error
    resetAvatarDropzone();
  }
}

function initAvatarUpload() {
  const fileInput = document.getElementById("profilePhoto") as HTMLInputElement;
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !dropArea) return;

  // Debug: Log available buckets (useful for troubleshooting)
  ProfileEnterpriseService.debugBuckets().catch(console.error);

  // Debug: Diagnosticar configuración de storage
  diagnoseStorageSetup();

  // Handle file input change
  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  });

  // Handle drag and drop
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove("dragover");

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        handleAvatarUpload(file);
      }
    }
  });

  // Handle keyboard navigation
  dropArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
}

function initProfileController() {
  const initializeController = () => {
    // Load profile data
    loadEnterpriseProfile();

    // Initialize avatar upload functionality
    initAvatarUpload();

    // Add event listener for save button
    const saveButton = document.querySelector(
      '[data-action="save-profile"]'
    ) as HTMLButtonElement;
    if (saveButton) {
      saveButton.addEventListener("click", handleSaveProfile);
    }
  };

  // Load profile data when the page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeController);
  } else {
    initializeController();
  }
}

// Export functions for potential external use
export {
  populateProfileForm,
  loadEnterpriseProfile,
  handleSaveProfile,
  initProfileController,
  handleAvatarUpload,
  loadExistingAvatarUI,
};

// Initialize the controller
initProfileController();
