import { AppliedJobsService } from '@/services/appliedJobs.service';
import type { DataTrabajosAplicados } from '@/interfaces/trabajosAplicados.interface';
import { ProfileGeneralCandidateService } from '@/services/profileGeneralCandidate.service';

// Estado global del controlador
let allJobs: DataTrabajosAplicados[] = [];
let filteredJobs: DataTrabajosAplicados[] = [];

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

    return `${formatCurrency(min)}–${formatCurrency(max)}/month`;
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
function getJobStatusBadge(estadoAplicacion: string, estadoTrabajo: boolean): { html: string } {
    if (!estadoTrabajo) {
        return {
            html: '<span class="text-danger d-inline-flex align-items-center gap-1"><i class="bi bi-x-circle"></i> Cerrado</span>'
        };
    }

    const estadoLower = estadoAplicacion.toLowerCase();

    const statuses: Record<string, string> = {
        'activo': '<span class="text-success d-inline-flex align-items-center gap-1"><i class="bi bi-check2-circle"></i> Activo</span>',
        'active': '<span class="text-success d-inline-flex align-items-center gap-1"><i class="bi bi-check2-circle"></i> Activo</span>',
        'pendiente': '<span class="text-warning d-inline-flex align-items-center gap-1"><i class="bi bi-clock"></i> Pendiente</span>',
        'pending': '<span class="text-warning d-inline-flex align-items-center gap-1"><i class="bi bi-clock"></i> Pendiente</span>',
        'revisando': '<span class="text-info d-inline-flex align-items-center gap-1"><i class="bi bi-eye"></i> En revisión</span>',
        'reviewing': '<span class="text-info d-inline-flex align-items-center gap-1"><i class="bi bi-eye"></i> En revisión</span>',
        'aceptado': '<span class="text-success d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Aceptado</span>',
        'accepted': '<span class="text-success d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Aceptado</span>',
        'rechazado': '<span class="text-danger d-inline-flex align-items-center gap-1"><i class="bi bi-x-circle-fill"></i> Rechazado</span>',
        'rejected': '<span class="text-danger d-inline-flex align-items-center gap-1"><i class="bi bi-x-circle-fill"></i> Rechazado</span>'
    };

    return {
        html: statuses[estadoLower] || '<span class="text-muted d-inline-flex align-items-center gap-1"><i class="bi bi-question-circle"></i> Desconocido</span>'
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
            return '<span class="text-danger">Expirado</span>';
        } else if (diffDays === 0) {
            return '<span class="text-warning">Hoy</span>';
        } else if (diffDays === 1) {
            return '<span class="text-warning">1 día</span>';
        } else if (diffDays <= 7) {
            return `<span class="text-warning">${diffDays} días</span>`;
        } else {
            return `<span class="text-muted">${diffDays} días</span>`;
        }
    } catch (error) {
        console.error('Error calculating expiration days:', error);
        return '<span class="text-muted">N/A</span>';
    }
}

/**
 * Crea el HTML para un trabajo aplicado
 */
function createJobApplicationHTML(job: DataTrabajosAplicados): string {
    const modalityBadge = getModalityBadge(job.modalidad);
    const statusBadge = getJobStatusBadge(job.estado_aplicacion, job.estado_trabajo);
    const formattedDate = formatDate(job.fecha_expiracion);
    const formattedSalary = formatSalaryRange(job.salario_minimo, job.salario_maximo);
    const daysUntilExpiration = getDaysUntilExpiration(job.fecha_expiracion);

    // Usar un logo por defecto si no hay logo de empresa
    const logoUrl = job.logo_empresa || '/src/assets/img/logo_grande.png';

    return `
        <article class="list-group-item px-2 py-3">
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
                            <span class="d-inline-flex align-items-center me-3">
                                <i class="bi bi-geo-alt me-1"></i>${job.ubicacion}
                            </span>
                            <span class="d-inline-flex align-items-center">
                                <i class="bi bi-cash-coin me-1"></i>${formattedSalary}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Fecha de aplicación (Col 2) -->
                <div class="col-6 col-lg-2">
                    <div class="text-muted small d-lg-block">
                        <i class="bi bi-calendar-event me-1 d-lg-none"></i>
                        ${formattedDate}
                    </div>
                </div>

                <!-- Estado (Col 3) -->
                <div class="col-6 col-lg-2">
                    ${statusBadge.html}
                </div>

                <!-- Días hasta expiración (Col 4) -->
                <div class="col-6 col-lg-2">
                    <div class="small">
                        <i class="bi bi-hourglass-split me-1 d-lg-none"></i>
                        ${daysUntilExpiration}
                    </div>
                </div>

                <!-- Acción (Col 5) -->
                <div class="col-6 col-lg-1 text-lg-end">
                    <button class="btn btn-outline-primary btn-sm w-100 w-lg-auto" type="button" 
                            data-action="open-job" data-job-id="${job.id_trabajo}">
                        <i class="bi bi-eye d-lg-none me-1"></i>
                        <span class="d-none d-lg-inline">Ver</span>
                        <span class="d-lg-none">Detalles</span>
                    </button>
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
            <p class="text-muted mt-3">Cargando trabajos aplicados...</p>
        </div>
    `;
}

/**
 * Muestra un mensaje cuando no hay trabajos aplicados
 */
function showEmptyState(): void {
    const container = document.getElementById('jobsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-briefcase fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">No has aplicado a ningún trabajo aún</h5>
            <p class="text-muted">Comienza a explorar oportunidades y aplica a los trabajos que te interesen.</p>
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
            <i class="bi bi-filter-circle fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">No se encontraron resultados</h5>
            <p class="text-muted">Intenta ajustar los filtros para ver más trabajos aplicados.</p>
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
 * Renderiza la lista de trabajos aplicados
 */
function renderAppliedJobs(jobs: DataTrabajosAplicados[]): void {
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
    container.innerHTML = jobs.map(job => createJobApplicationHTML(job)).join('');

    // Actualizar contador
    updateJobCount(jobs.length);

    // Agregar event listeners
    attachJobDetailListeners();
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
 * Aplica los filtros seleccionados
 */
function applyFilters(): void {
    const statusFilter = (document.getElementById('filterStatus') as HTMLSelectElement)?.value || 'all';
    const modalityFilter = (document.getElementById('filterModality') as HTMLSelectElement)?.value || 'all';

    // Iniciar con todos los trabajos
    let filtered = [...allJobs];

    // Aplicar filtro de estado
    if (statusFilter !== 'all') {
        filtered = AppliedJobsService.filterByStatus(filtered, statusFilter);
    }

    // Aplicar filtro de modalidad
    if (modalityFilter !== 'all') {
        filtered = AppliedJobsService.filterByModality(filtered, modalityFilter);
    }

    // Ordenar por fecha (más recientes primero)
    filtered = AppliedJobsService.sortByDate(filtered, true);

    // Actualizar estado y renderizar
    filteredJobs = filtered;
    renderAppliedJobs(filteredJobs);
}

/**
 * Limpia todos los filtros
 */
function clearFilters(): void {
    const statusSelect = document.getElementById('filterStatus') as HTMLSelectElement;
    const modalitySelect = document.getElementById('filterModality') as HTMLSelectElement;

    if (statusSelect) statusSelect.value = 'all';
    if (modalitySelect) modalitySelect.value = 'all';

    applyFilters();
}

/**
 * Inicializa los event listeners para los filtros
 */
function initFilterListeners(): void {
    const statusFilter = document.getElementById('filterStatus');
    const modalityFilter = document.getElementById('filterModality');

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (modalityFilter) {
        modalityFilter.addEventListener('change', applyFilters);
    }
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

/**
 * Carga todos los trabajos aplicados
 */
async function loadAllAppliedJobs(): Promise<void> {
    try {
        // Mostrar estado de carga
        showLoadingState();

        // Llamar al servicio para obtener los datos
        const response = await AppliedJobsService.fetchAllAppliedJobs();

        if (!response.success) {
            showError(response.message);
            return;
        }

        // Guardar los trabajos en el estado global
        allJobs = response.data || [];
        filteredJobs = [...allJobs];

        // Ordenar por fecha (más recientes primero)
        filteredJobs = AppliedJobsService.sortByDate(filteredJobs, true);

        // Renderizar los trabajos
        renderAppliedJobs(filteredJobs);

    } catch (error) {
        console.error('Error loading applied jobs:', error);
        showError('Hubo un error al cargar los trabajos aplicados. Por favor, intenta de nuevo.');
    }
}

/**
 * Inicializa el controlador de trabajos aplicados
 */
function initAppliedJobsController(): void {
    const initializeController = async () => {
        try {
            console.log('Inicializando controlador de trabajos aplicados...');

            // Inicializar filtros
            initFilterListeners();

            // Cargar todos los trabajos aplicados
            await loadAllAppliedJobs();

            // Actualizar el badge de alertas en el sidebar
            await updateAlertsBadge();

            console.log('Controlador de trabajos aplicados inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar el controlador de trabajos aplicados:', error);
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
    loadAllAppliedJobs,
    renderAppliedJobs,
    applyFilters,
    clearFilters,
    initAppliedJobsController,
    formatDate,
    formatSalaryRange,
    getModalityBadge,
    getJobStatusBadge,
    getDaysUntilExpiration
};

// Inicializar el controlador
initAppliedJobsController();
