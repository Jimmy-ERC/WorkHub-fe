import { FavoriteJobsService } from '@/services/favoriteJobs.service';
import type { DataTrabajosFavoritos } from '@/interfaces/trabajosFavoritos.interface';

// Estado global del controlador
let allJobs: DataTrabajosFavoritos[] = [];
let filteredJobs: DataTrabajosFavoritos[] = [];

/**
 * Formatea una fecha para mostrarla en formato legible
 */
function formatDate(dateString: Date | string): string {
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-ES', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha no disponible';
    }
}

/**
 * Formatea el rango de salario
 */
function formatSalaryRange(min: number, max: number): string {
    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}k`;
        }
        return `$${amount}`;
    };

    return `${formatCurrency(min)}–${formatCurrency(max)}`;
}

/**
 * Obtiene la clase y el texto del badge según la modalidad
 */
function getModalityBadge(modalidad: string): { className: string; text: string } {
    const modalidadLower = modalidad.toLowerCase();

    const badges: Record<string, { className: string; text: string }> = {
        'remoto': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Remote'
        },
        'remote': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Remote'
        },
        'tiempo completo': {
            className: 'badge rounded-pill bg-primary-subtle border border-primary-subtle text-primary',
            text: 'Full Time'
        },
        'full time': {
            className: 'badge rounded-pill bg-primary-subtle border border-primary-subtle text-primary',
            text: 'Full Time'
        },
        'temporal': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Temporary'
        },
        'temporary': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Temporary'
        },
        'contrato': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Contract Base'
        },
        'contract': {
            className: 'badge rounded-pill bg-body-tertiary border text-secondary',
            text: 'Contract Base'
        },
        'medio tiempo': {
            className: 'badge rounded-pill bg-warning-subtle border border-warning-subtle text-warning',
            text: 'Part Time'
        },
        'part time': {
            className: 'badge rounded-pill bg-warning-subtle border border-warning-subtle text-warning',
            text: 'Part Time'
        }
    };

    return badges[modalidadLower] || {
        className: 'badge rounded-pill bg-body-tertiary border text-secondary',
        text: modalidad
    };
}

/**
 * Obtiene el estado del trabajo y su formato visual
 */
function getJobStatusBadge(estadoTrabajo: boolean): { html: string } {
    if (!estadoTrabajo) {
        return {
            html: '<span class="text-danger d-inline-flex align-items-center gap-1"><i class="bi bi-x-circle-fill"></i> Cerrado</span>'
        };
    }

    return {
        html: '<span class="text-success d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Activo</span>'
    };
}

/**
 * Calcula los días restantes hasta la expiración
 */
function getDaysUntilExpiration(expirationDate: Date | string): string {
    try {
        const now = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return '<span class="text-danger fw-semibold"><i class="bi bi-exclamation-triangle me-1"></i>Expirado</span>';
        } else if (diffDays === 0) {
            return '<span class="text-danger fw-semibold"><i class="bi bi-clock-fill me-1"></i>Hoy</span>';
        } else if (diffDays === 1) {
            return '<span class="text-warning fw-semibold"><i class="bi bi-clock me-1"></i>1 día</span>';
        } else if (diffDays <= 7) {
            return `<span class="text-warning fw-semibold"><i class="bi bi-clock me-1"></i>${diffDays} días</span>`;
        } else {
            return `<span class="text-muted"><i class="bi bi-calendar-event me-1"></i>${diffDays} días</span>`;
        }
    } catch (error) {
        console.error('Error calculating expiration days:', error);
        return '<span class="text-muted">N/A</span>';
    }
}

/**
 * Crea el HTML para un trabajo favorito
 */
function createFavoriteJobHTML(job: DataTrabajosFavoritos): string {
    const modalityBadge = getModalityBadge(job.modalidad);
    const statusBadge = getJobStatusBadge(job.estado_trabajo);
    const formattedSalary = formatSalaryRange(job.salario_minimo, job.salario_maximo);
    const daysUntilExpiration = getDaysUntilExpiration(job.fecha_expiracion);

    // Usar un logo por defecto si no hay logo de empresa
    const logoUrl = job.logo_empresa || '/src/assets/img/logo_grande.png';

    return `
        <article class="list-group-item px-2 py-3 position-relative">
            <div class="row g-2 align-items-center">
                <!-- Información del trabajo (Col 1) -->
                <div class="col-lg-5 d-flex align-items-center gap-3">
                    <img src="${logoUrl}" class="rounded-3 border img-fluid"
                        alt="Logo ${job.nombre_empresa}" width="48" height="48"
                        onerror="this.src='/src/assets/img/logo_grande.png'">
                    <div class="flex-grow-1">
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <a href="#" class="link-dark fw-medium text-decoration-none" 
                               data-action="open-job" data-job-id="${job.id_trabajo}">
                                ${job.nombre_trabajo}
                            </a>
                            <span class="${modalityBadge.className}" data-filter-tag="${job.modalidad.toLowerCase()}">
                                ${modalityBadge.text}
                            </span>
                        </div>
                        <div class="text-muted small">
                            <span class="d-inline-flex align-items-center me-3">
                                <i class="bi bi-building me-1"></i>${job.nombre_empresa}
                            </span>
                            <span class="d-inline-flex align-items-center">
                                <i class="bi bi-geo-alt me-1"></i>${job.ubicacion}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Salario (Col 2) -->
                <div class="col-6 col-lg-2">
                    <div class="text-dark fw-medium">
                        <i class="bi bi-cash-coin me-1 text-success"></i>
                        ${formattedSalary}
                    </div>
                    <div class="text-muted small">por mes</div>
                </div>

                <!-- Estado (Col 3) -->
                <div class="col-6 col-lg-2">
                    ${statusBadge.html}
                </div>

                <!-- Días hasta expiración (Col 4) -->
                <div class="col-6 col-lg-2">
                    ${daysUntilExpiration}
                </div>

                <!-- Acciones (Col 5) -->
                <div class="col-6 col-lg-1 text-lg-end">
                    <div class="d-flex flex-lg-column gap-1">
                        <button class="btn btn-primary btn-sm flex-grow-1" type="button" 
                                data-action="open-job" data-job-id="${job.id_trabajo}"
                                title="Ver detalles del trabajo">
                            <i class="bi bi-eye me-1"></i>
                            <span class="d-none d-lg-inline">Ver</span>
                            <span class="d-lg-none">Detalles</span>
                        </button>
                        <button class="btn btn-outline-danger btn-sm flex-grow-1" type="button" 
                                data-action="remove-favorite" data-job-id="${job.id_trabajo}"
                                title="Quitar de favoritos">
                            <i class="bi bi-bookmark-x-fill"></i>
                            <span class="d-none d-lg-inline d-xl-none">Quitar</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

/**
 * Muestra un estado de carga
 */
function showLoadingState(): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-3">Cargando trabajos favoritos...</p>
        </div>
    `;
}

/**
 * Muestra un mensaje cuando no hay trabajos favoritos
 */
function showEmptyState(): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-bookmark-heart fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">Aún no tienes trabajos favoritos</h5>
            <p class="text-muted">Explora ofertas de trabajo y guarda las que te interesen para revisarlas más tarde.</p>
            <a href="/src/pages/candidate/home.html" class="btn btn-primary mt-3">
                <i class="bi bi-search me-2"></i>Explorar trabajos
            </a>
        </div>
    `;

    // Actualizar contador
    updateJobCount(0);
}

/**
 * Muestra un mensaje cuando no hay resultados con los filtros actuales
 */
function showNoResultsState(): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-funnel fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">No se encontraron resultados</h5>
            <p class="text-muted">Intenta ajustar los filtros para ver más trabajos favoritos.</p>
            <button class="btn btn-outline-primary mt-3" type="button" id="clearFiltersBtn">
                <i class="bi bi-x-circle me-2"></i>Limpiar filtros
            </button>
        </div>
    `;

    // Event listener para limpiar filtros
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
}

/**
 * Muestra un mensaje de error
 */
function showError(message: string): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>${message}</div>
        </div>
    `;
}

/**
 * Actualiza el contador de trabajos
 */
function updateJobCount(count: number): void {
    const countElement = document.getElementById('totalJobsCount');
    if (countElement) {
        countElement.textContent = count.toString();
    }
}

/**
 * Renderiza la lista de trabajos favoritos
 */
function renderFavoriteJobs(jobs: DataTrabajosFavoritos[]): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    if (jobs.length === 0) {
        // Si no hay trabajos en absoluto, mostrar empty state
        if (allJobs.length === 0) {
            showEmptyState();
        } else {
            // Si hay trabajos pero los filtros no devuelven resultados
            showNoResultsState();
        }
        return;
    }

    // Renderizar todos los trabajos
    container.innerHTML = jobs.map(job => createFavoriteJobHTML(job)).join('');

    // Actualizar contador
    updateJobCount(jobs.length);

    // Agregar event listeners
    attachJobDetailListeners();
    attachRemoveFavoriteListeners();
}

/**
 * Agrega event listeners a los botones de ver detalles
 */
function attachJobDetailListeners(): void {
    const detailButtons = document.querySelectorAll('[data-action="open-job"]');

    detailButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const jobId = (button as HTMLElement).dataset.jobId;
            if (jobId) {
                // Redirigir a la página de detalles del trabajo
                window.location.href = `/src/pages/candidate/view-job.html?id=${jobId}`;
            }
        });
    });
}

/**
 * Agrega event listeners a los botones de quitar de favoritos
 */
function attachRemoveFavoriteListeners(): void {
    const removeButtons = document.querySelectorAll('[data-action="remove-favorite"]');

    removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const jobId = (button as HTMLElement).dataset.jobId;
            if (jobId) {
                const confirmed = confirm('¿Estás seguro de que deseas quitar este trabajo de tus favoritos?');
                if (confirmed) {
                    await removeFavoriteJob(parseInt(jobId));
                }
            }
        });
    });
}

/**
 * Quita un trabajo de favoritos
 */
async function removeFavoriteJob(jobId: number): Promise<void> {
    try {
        // Aquí deberías implementar la lógica para eliminar el favorito del backend
        // Por ahora, solo lo quitamos de la lista local
        console.log('Quitando trabajo de favoritos:', jobId);

        // Filtrar el trabajo eliminado
        allJobs = allJobs.filter(job => job.id_trabajo !== jobId);

        // Aplicar filtros nuevamente
        applyFilters();

        // Mostrar mensaje de éxito
        showSuccessToast('Trabajo removido de favoritos exitosamente');

    } catch (error) {
        console.error('Error removing favorite job:', error);
        showErrorToast('Error al quitar el trabajo de favoritos. Intenta de nuevo.');
    }
}

/**
 * Muestra un toast de éxito
 */
function showSuccessToast(message: string): void {
    // Implementación simple de toast
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-success text-white">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong class="me-auto">Éxito</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Muestra un toast de error
 */
function showErrorToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-danger text-white">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Aplica los filtros y ordenamiento seleccionados
 */
function applyFilters(): void {
    const statusFilter = (document.getElementById('filterStatus') as HTMLSelectElement)?.value || 'all';
    const modalityFilter = (document.getElementById('filterModality') as HTMLSelectElement)?.value || 'all';
    const sortBy = (document.getElementById('sortBy') as HTMLSelectElement)?.value || 'date-desc';

    // Iniciar con todos los trabajos
    let filtered = [...allJobs];

    // Aplicar filtro de estado
    if (statusFilter !== 'all') {
        filtered = FavoriteJobsService.filterByStatus(filtered, statusFilter);
    }

    // Aplicar filtro de modalidad
    if (modalityFilter !== 'all') {
        filtered = FavoriteJobsService.filterByModality(filtered, modalityFilter);
    }

    // Aplicar ordenamiento
    switch (sortBy) {
        case 'date-desc':
            filtered = FavoriteJobsService.sortByDate(filtered, true);
            break;
        case 'date-asc':
            filtered = FavoriteJobsService.sortByDate(filtered, false);
            break;
        case 'salary-desc':
            filtered = FavoriteJobsService.sortBySalary(filtered, true);
            break;
        case 'salary-asc':
            filtered = FavoriteJobsService.sortBySalary(filtered, false);
            break;
    }

    // Actualizar estado y renderizar
    filteredJobs = filtered;
    renderFavoriteJobs(filteredJobs);
}

/**
 * Limpia todos los filtros
 */
function clearFilters(): void {
    const statusSelect = document.getElementById('filterStatus') as HTMLSelectElement;
    const modalitySelect = document.getElementById('filterModality') as HTMLSelectElement;
    const sortSelect = document.getElementById('sortBy') as HTMLSelectElement;

    if (statusSelect) statusSelect.value = 'all';
    if (modalitySelect) modalitySelect.value = 'all';
    if (sortSelect) sortSelect.value = 'date-desc';

    applyFilters();
}

/**
 * Inicializa los event listeners para los filtros
 */
function initFilterListeners(): void {
    const statusFilter = document.getElementById('filterStatus');
    const modalityFilter = document.getElementById('filterModality');
    const sortBy = document.getElementById('sortBy');

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (modalityFilter) {
        modalityFilter.addEventListener('change', applyFilters);
    }

    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
}

/**
 * Carga todos los trabajos favoritos
 */
async function loadAllFavoriteJobs(): Promise<void> {
    try {
        // Mostrar estado de carga
        showLoadingState();

        // Llamar al servicio para obtener los datos
        const response = await FavoriteJobsService.fetchAllFavoriteJobs();

        if (!response.success) {
            showError(response.message);
            return;
        }

        // Guardar los trabajos en el estado global
        allJobs = response.data || [];
        filteredJobs = [...allJobs];

        // Ordenar por fecha (más recientes primero)
        filteredJobs = FavoriteJobsService.sortByDate(filteredJobs, true);

        // Renderizar los trabajos
        renderFavoriteJobs(filteredJobs);

    } catch (error) {
        console.error('Error loading favorite jobs:', error);
        showError('Hubo un error al cargar los trabajos favoritos. Por favor, intenta de nuevo.');
    }
}

/**
 * Inicializa el controlador de trabajos favoritos
 */
function initFavoriteJobsController(): void {
    const initializeController = async () => {
        try {
            console.log('Inicializando controlador de trabajos favoritos...');

            // Inicializar filtros
            initFilterListeners();

            // Cargar todos los trabajos favoritos
            await loadAllFavoriteJobs();

            console.log('Controlador de trabajos favoritos inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar el controlador de trabajos favoritos:', error);
            showError('Error al cargar la página. Por favor, recarga la página.');
        }
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeController);
    } else {
        initializeController();
    }
}

// Exportar funciones para uso externo
export {
    loadAllFavoriteJobs,
    renderFavoriteJobs,
    applyFilters,
    clearFilters,
    removeFavoriteJob,
    initFavoriteJobsController,
    formatDate,
    formatSalaryRange,
    getModalityBadge,
    getJobStatusBadge,
    getDaysUntilExpiration
};

// Inicializar el controlador
initFavoriteJobsController();
