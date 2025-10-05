import { CurriculumService } from "@/services/curriculumService";
import type { Curriculum } from "@/interfaces/curriculum.interface";

// Variable de módulo para almacenar el idPerfil actual
let currentIdPerfil: number | null = null;

//  Renderiza la lista de CVs en el DOM

export function renderCVList(cvs: Curriculum[]) {
  const cvListContainer = document.getElementById("cvList");
  if (!cvListContainer) return;

  if (cvs.length === 0) {
    cvListContainer.innerHTML = `
            <div class="cv-empty-state">
                <i class="bi bi-file-earmark-text"></i>
                <p class="mb-0">No has subido ningún CV aún</p>
            </div>
        `;
    toggleAddCvButton(true);
    return;
  }

  cvListContainer.innerHTML = cvs.map((cv) => createCVItemHTML(cv)).join("");

  // Agregar event listeners a los botones
  cvs.forEach((cv) => {
    attachCVItemListeners(cv);
  });

  // Mostrar/ocultar botón de agregar según el límite
  toggleAddCvButton(cvs.length < 3);
}

//  Crea el HTML para un item de CV

function createCVItemHTML(cv: Curriculum): string {
  const fileExtension = CurriculumService.getFileExtension(
    cv.url_curriculum
  ).toUpperCase();
  const fileSize = CurriculumService.formatFileSize(cv.tamano_archivo);

  // Determinar el icono según la extensión
  let icon = "bi-file-earmark-pdf";
  if (fileExtension.includes("DOC")) {
    icon = "bi-file-earmark-word";
  }

  return `
        <div class="cv-item d-flex align-items-center gap-3" data-cv-id="${cv.id_curriculum}">
            <div class="cv-item-icon">
                <i class="bi ${icon} fs-3 text-primary"></i>
            </div>
            <div class="cv-item-info">
                <div class="cv-item-name" 
                    data-cv-id="${cv.id_curriculum}" 
                    data-original-name="${cv.nombre_archivo}"
                    contenteditable="false">
                    ${cv.nombre_archivo}
                </div>
                <div class="cv-item-size">${fileSize}</div>
            </div>
            <div class="cv-item-actions">
                <button type="button" 
                    class="btn btn-sm btn-outline-primary" 
                    data-action="edit-cv-name" 
                    data-cv-id="${cv.id_curriculum}"
                    title="Editar nombre">
                    <i class="bi bi-pencil"></i> Editar Resumen
                </button>
                <button type="button" 
                    class="btn btn-sm btn-outline-danger" 
                    data-action="delete-cv" 
                    data-cv-id="${cv.id_curriculum}"
                    data-cv-url="${cv.url_curriculum}"
                    title="Eliminar">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

// Adjunta los event listeners a un item de CV

function attachCVItemListeners(cv: Curriculum) {
  // Botón editar nombre
  const editBtn = document.querySelector(
    `[data-action="edit-cv-name"][data-cv-id="${cv.id_curriculum}"]`
  );
  if (editBtn) {
    editBtn.addEventListener("click", () => handleEditCVName(cv.id_curriculum));
  }

  // Botón eliminar
  const deleteBtn = document.querySelector(
    `[data-action="delete-cv"][data-cv-id="${cv.id_curriculum}"]`
  );
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () =>
      handleDeleteCV(cv.id_curriculum, cv.url_curriculum)
    );
  }

  // Click en el nombre para descargar
  const nameElement = document.querySelector(
    `.cv-item-name[data-cv-id="${cv.id_curriculum}"]`
  );
  if (nameElement) {
    nameElement.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute("contenteditable") !== "true") {
        handleDownloadCV(cv.url_curriculum, cv.nombre_archivo);
      }
    });
  }
}

// Maneja la edición del nombre del CV

async function handleEditCVName(cvId: number) {
  const nameElement = document.querySelector(
    `.cv-item-name[data-cv-id="${cvId}"]`
  ) as HTMLElement;
  const editBtn = document.querySelector(
    `[data-action="edit-cv-name"][data-cv-id="${cvId}"]`
  ) as HTMLButtonElement;

  if (!nameElement || !editBtn) return;

  const isEditing = nameElement.getAttribute("contenteditable") === "true";

  if (isEditing) {
    // Guardar cambios
    const newName = nameElement.textContent?.trim() || "";
    const originalName = nameElement.getAttribute("data-original-name") || "";

    if (newName === "" || newName === originalName) {
      // Cancelar edición
      nameElement.textContent = originalName;
      nameElement.setAttribute("contenteditable", "false");
      nameElement.classList.remove("editing");
      editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar Resumen';
      return;
    }

    // Mostrar loading
    editBtn.disabled = true;
    editBtn.innerHTML = '<span class="cv-loading"></span> Guardando...';

    try {
      const result = await CurriculumService.updateCurriculumName(
        cvId,
        newName
      );

      if (result.success) {
        nameElement.setAttribute("data-original-name", newName);
        nameElement.setAttribute("contenteditable", "false");
        nameElement.classList.remove("editing");
        editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar Resumen';
        showToast("Nombre actualizado exitosamente", "success");
      } else {
        nameElement.textContent = originalName;
        nameElement.setAttribute("contenteditable", "false");
        nameElement.classList.remove("editing");
        editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar Resumen';
        showToast(result.message || "Error al actualizar el nombre", "danger");
      }
    } catch (error) {
      nameElement.textContent = originalName;
      nameElement.setAttribute("contenteditable", "false");
      nameElement.classList.remove("editing");
      editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar Resumen';
      showToast("Error al actualizar el nombre", "danger");
      console.error("Error updating CV name:", error);
    } finally {
      editBtn.disabled = false;
    }
  } else {
    // Activar modo edición
    nameElement.setAttribute("contenteditable", "true");
    nameElement.classList.add("editing");
    nameElement.focus();

    // Seleccionar todo el texto
    const range = document.createRange();
    range.selectNodeContents(nameElement);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    editBtn.innerHTML = '<i class="bi bi-check-lg"></i> Guardar';

    // Guardar al presionar Enter
    nameElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleEditCVName(cvId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        const originalName =
          nameElement.getAttribute("data-original-name") || "";
        nameElement.textContent = originalName;
        nameElement.setAttribute("contenteditable", "false");
        nameElement.classList.remove("editing");
        editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar Resumen';
      }
    });
  }
}

// Maneja la eliminación de un CV

async function handleDeleteCV(cvId: number, cvUrl: string) {
  const confirmed = confirm(
    "¿Estás seguro de que deseas eliminar este CV? Esta acción no se puede deshacer."
  );

  if (!confirmed) return;

  const cvItem = document.querySelector(`.cv-item[data-cv-id="${cvId}"]`);
  if (!cvItem) return;

  // Mostrar loading state
  cvItem.classList.add("opacity-50");
  const deleteBtn = cvItem.querySelector(
    `[data-action="delete-cv"]`
  ) as HTMLButtonElement;
  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="cv-loading"></span> Eliminando...';
  }

  try {
    const result = await CurriculumService.deleteCurriculum(cvId, cvUrl);

    if (result.success) {
      // Animar salida y remover
      cvItem.classList.add("animate__animated", "animate__fadeOut");
      setTimeout(() => {
        cvItem.remove();
        // Recargar la lista completa
        reloadCVList(currentIdPerfil || undefined);
        showToast("CV eliminado exitosamente", "success");
      }, 300);
    } else {
      cvItem.classList.remove("opacity-50");
      if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
      }
      showToast(result.message || "Error al eliminar el CV", "danger");
    }
  } catch (error) {
    cvItem.classList.remove("opacity-50");
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
    }
    showToast("Error al eliminar el CV", "danger");
    console.error("Error deleting CV:", error);
  }
}

// Maneja la descarga de un CV

function handleDownloadCV(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Muestra/oculta el botón de agregar CV según el límite

function toggleAddCvButton(show: boolean) {
  const addCvSection = document.getElementById("addCvSection");
  if (addCvSection) {
    addCvSection.style.display = show ? "block" : "none";
  }
}

//  Recarga la lista de CVs

export async function reloadCVList(idPerfil?: number) {
  try {
    // Si no se proporciona idPerfil, intentar obtenerlo del perfil actual
    let profileId = idPerfil;

    if (!profileId) {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      // Obtener el perfil para conseguir el id_perfil
      const profileResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/candidate/perfiles/${user.id}`
      );
      if (!profileResponse.ok) {
        console.warn("No se pudo cargar el perfil");
        return;
      }

      const profileData = await profileResponse.json();
      profileId = profileData.data.id_perfil;
    }

    if (!profileId) {
      console.error("No se pudo obtener el ID de perfil");
      return;
    }

    // Cargar CVs
    const result = await CurriculumService.fetchCurriculums(profileId);

    if (result.success && "data" in result) {
      renderCVList(result.data);
    } else {
      renderCVList([]);
    }
  } catch (error) {
    console.error("Error reloading CV list:", error);
    renderCVList([]);
  }
}

// Toast de notificacion
function showToast(
  message: string,
  type: "success" | "danger" | "warning" = "success"
) {
  const toastContainer =
    document.getElementById("toastContainer") || createToastContainer();

  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = `toast align-items-center text-bg-${type} border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Inicializar y mostrar el toast usando Bootstrap
  const bsToast = new (window as any).bootstrap.Toast(toast);
  bsToast.show();

  // Remover el toast después de que se oculte
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

// Crea el contenedor de toasts si no existe

function createToastContainer(): HTMLElement {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  container.style.zIndex = "9999";
  document.body.appendChild(container);
  return container;
}

/**
 * Inicializa el sistema de carga de CVs
 */
export function initCVUpload(idPerfil: number) {
  // Almacenar el idPerfil en la variable de módulo
  currentIdPerfil = idPerfil;

  const fileInput = document.getElementById("cvFile") as HTMLInputElement;
  const dropArea = document.getElementById("cvDropArea");

  if (!fileInput || !dropArea) {
    console.error("CV upload elements not found");
    return;
  }

  // Handle file input change
  fileInput.addEventListener("change", async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await handleCVUpload(file, idPerfil);
      target.value = ""; // Reset input
    }
  });

  // Handle drag and drop
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropArea.classList.remove("dragover");

    const file = event.dataTransfer?.files[0];
    if (file) {
      await handleCVUpload(file, idPerfil);
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

// Maneja la carga de un archivo de CV

async function handleCVUpload(file: File, idPerfil: number) {
  try {
    // Mostrar loading state
    const dropArea = document.getElementById("cvDropArea");
    if (dropArea) {
      dropArea.classList.add("opacity-50");
      dropArea.innerHTML = `
                <div class="cv-loading" style="width: 2rem; height: 2rem;"></div>
                <div class="mt-2">Subiendo archivo...</div>
            `;
    }

    // Subir archivo al storage
    const uploadResult = await CurriculumService.uploadCurriculumFile(file);

    if (!uploadResult.success || !uploadResult.url) {
      showToast(uploadResult.message || "Error al subir el archivo", "danger");
      resetCVDropzone();
      return;
    }

    // Crear registro en la base de datos
    const curriculumData = {
      id_perfil: idPerfil,
      url_curriculum: uploadResult.url,
      nombre_archivo: file.name,
      tamano_archivo: file.size,
    };

    const createResult = await CurriculumService.createCurriculum(
      curriculumData
    );

    if (createResult.success) {
      showToast("CV subido exitosamente", "success");
      // Recargar la lista de CVs con el idPerfil actual
      await reloadCVList(idPerfil);
    } else {
      showToast(createResult.message || "Error al registrar el CV", "danger");
    }
  } catch (error) {
    console.error("Error uploading CV:", error);
    showToast(
      error instanceof Error
        ? error.message
        : "Error desconocido al subir el CV",
      "danger"
    );
  } finally {
    resetCVDropzone();
  }
}

// Resetea el dropzone de CV a su estado inicial

function resetCVDropzone() {
  const dropArea = document.getElementById("cvDropArea");
  if (!dropArea) return;

  dropArea.classList.remove("opacity-50");
  dropArea.innerHTML = `
        <i class="bi bi-file-earmark-arrow-up fs-1 mb-2 text-primary" aria-hidden="true"></i>
        <div class="fw-medium">Add Cv/Resume</div>
        <small class="text-muted">Browse file o suéltalo aquí. only pdf</small>
        <div class="text-muted small mt-2" id="cvHelp">
            Formatos permitidos: PDF, DOC, DOCX. Tamaño máx. 30 MB. (Máximo 3 archivos)
        </div>
    `;
}
