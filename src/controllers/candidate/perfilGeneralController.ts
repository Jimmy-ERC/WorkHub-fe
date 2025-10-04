import { ProfileGeneralCandidateService } from "@/services/profileGeneralCandidate.service";
import type { DataTrabajosAplicados } from "@/interfaces/trabajosAplicados.interface";
import { sessionManager } from "@/lib/session";

/**
 * Actualiza el saludo con el nombre del usuario
 */
async function updateUserGreeting(): Promise<void> {
    try {
        const data = await sessionManager.getUserFromSupabase();

        if (data.success && data.user?.user_metadata?.full_name) {
            const greetingElement = document.getElementById('userGreeting');
            if (greetingElement) {
                greetingElement.textContent = `Hola, ${data.user.user_metadata.full_name}`;
            }
        }
    } catch (error) {
        console.error('Error updating user greeting:', error);
        // Mantener el saludo por defecto si hay error
    }
}

/**
 * Formatea una fecha para mostrarla en formato legible
 */
function formatDate(dateString: Date | string): string {
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
            return `$${(amount / 1000).toFixed(0)}k`;
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
 * Crea el HTML para un trabajo aplicado
 */
function createJobApplicationHTML(job: DataTrabajosAplicados): string {
    const modalityBadge = getModalityBadge(job.modalidad);
    const statusBadge = getJobStatusBadge(job.estado_aplicacion, job.estado_trabajo);
    const formattedDate = formatDate(job.fecha_expiracion);
    const formattedSalary = formatSalaryRange(job.salario_minimo, job.salario_maximo);

    // Usar un logo por defecto si no hay logo de empresa
    const logoUrl = job.logo_empresa || '/src/assets/img/logo_grande.png';

    return `
        <article class="list-group-item px-2 py-3">
            <div class="row g-2 align-items-center">
                <div class="col-lg-6 d-flex align-items-center gap-3">
                    <img src="${logoUrl}" class="rounded-3 border img-fluid"
                        alt="Logo ${job.nombre_empresa}" width="42" height="42"
                        onerror="this.src='/src/assets/img/logo_grande.png'">
                    <div>
                        <div class="d-flex flex-wrap align-items-center gap-2">
                            <a href="#" class="link-dark fw-medium text-decoration-none" 
                               data-action="open-job" data-job-id="${job.id_trabajo}">
                                ${job.nombre_trabajo}
                            </a>
                            <span class="${modalityBadge.className}" data-filter-tag="${job.modalidad.toLowerCase()}">
                                ${modalityBadge.text}
                            </span>
                        </div>
                        <div class="text-muted small d-flex flex-wrap align-items-center gap-3">
                            <span><i class="bi bi-geo-alt me-1"></i>${job.ubicacion}</span>
                            <span><i class="bi bi-cash-coin me-1"></i>${formattedSalary}</span>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-2 text-lg-start text-muted small">${formattedDate}</div>
                <div class="col-6 col-lg-2">
                    ${statusBadge.html}
                </div>
                <div class="col-12 col-lg-2 text-lg-end">
                    <button class="btn btn-outline-primary btn-sm" type="button" 
                            data-action="open-job" data-job-id="${job.id_trabajo}">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Muestra un mensaje cuando no hay trabajos aplicados
 */
function showEmptyState(): void {
    const listContainer = document.querySelector('.list-group.list-group-flush');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-briefcase fs-1 text-muted mb-3"></i>
            <h5 class="text-muted">No has aplicado a ningún trabajo aún</h5>
            <p class="text-muted">Comienza a explorar oportunidades y aplica a los trabajos que te interesen.</p>
            <a href="/src/pages/candidate/home.html" class="btn btn-primary mt-3">
                <i class="bi bi-search me-2"></i>Explorar trabajos
            </a>
        </div>
    `;
}

/**
 * Muestra un mensaje de error
 */
function showError(message: string): void {
    const listContainer = document.querySelector('.list-group.list-group-flush');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>${message}</div>
        </div>
    `;
}

/**
 * Muestra un estado de carga
 */
function showLoadingState(): void {
    const listContainer = document.querySelector('.list-group.list-group-flush');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-3">Cargando trabajos aplicados...</p>
        </div>
    `;
}

/**
 * Renderiza la lista de trabajos aplicados
 */
function renderAppliedJobs(jobs: DataTrabajosAplicados[]): void {
    const listContainer = document.querySelector('.list-group.list-group-flush');
    if (!listContainer) {
        console.error('Container element not found');
        return;
    }

    if (jobs.length === 0) {
        showEmptyState();
        return;
    }

    // Limitar a los últimos 5 trabajos aplicados
    const recentJobs = jobs.slice(0, 5);

    listContainer.innerHTML = recentJobs.map(job => createJobApplicationHTML(job)).join('');

    // Agregar event listeners para los botones de "Ver Detalles"
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
            const jobId = (event.currentTarget as HTMLElement).getAttribute('data-job-id');

            if (jobId) {
                // Redirigir a la página de detalles del trabajo
                window.location.href = `/src/pages/candidate/view-job.html?id=${jobId}`;
            }
        });
    });
}

/**
 * Actualiza las tarjetas de métricas con los datos del backend
 */
async function updateStatsCards(): Promise<void> {
    try {
        const response = await ProfileGeneralCandidateService.fetchProfileStats();

        if (!response.success || !response.data) {
            console.error('Error loading stats:', response.message);
            // Mantener valores por defecto si hay error
            return;
        }

        const { aplicaciones_count, favoritos_count, alertas_trabajo_count } = response.data;

        // Actualizar Card 1 - Trabajos aplicados
        const appliedCountElement = document.getElementById('statsAppliedCount');
        if (appliedCountElement) {
            appliedCountElement.textContent = aplicaciones_count;
        }

        // Actualizar Card 2 - Trabajos favoritos
        const favoritesCountElement = document.getElementById('statsFavoritesCount');
        if (favoritesCountElement) {
            favoritesCountElement.textContent = favoritos_count;
        }

        // Actualizar Card 3 - Alertas de trabajo
        const alertsCountElement = document.getElementById('statsAlertsCount');
        if (alertsCountElement) {
            alertsCountElement.textContent = alertas_trabajo_count;
        }

        // También actualizar el badge de alertas en el sidebar si existe
        const alertBadge = document.querySelector('[data-route="alerts"] .badge');
        if (alertBadge) {
            const alertCount = parseInt(alertas_trabajo_count);
            alertBadge.textContent = alertCount > 0 ? alertCount.toString().padStart(2, '0') : '00';
        }

    } catch (error) {
        console.error('Error updating stats cards:', error);
        // Mantener valores por defecto si hay error
    }
}

/**
 * Carga y muestra los trabajos aplicados recientemente
 */
async function loadRecentlyAppliedJobs(): Promise<void> {
    try {
        // Mostrar estado de carga
        showLoadingState();

        // Llamar al servicio para obtener los datos
        const response = await ProfileGeneralCandidateService.fetchRecentlyAppliedJobs();

        if (!response.success) {
            showError(response.message || 'Error al cargar los trabajos aplicados');
            return;
        }

        // Renderizar los trabajos
        renderAppliedJobs(response.data);

    } catch (error) {
        console.error('Error loading recently applied jobs:', error);
        showError('Error inesperado al cargar los trabajos aplicados');
    }
}

/**
 * Inicializa el controlador del perfil general
 */
function initProfileGeneralController(): void {
    const initializeController = async () => {
        // Actualizar el saludo con el nombre del usuario
        await updateUserGreeting();

        // Cargar y actualizar las estadísticas
        await updateStatsCards();

        // Cargar los trabajos aplicados cuando la página cargue
        await loadRecentlyAppliedJobs();

        // Event listener para "Ver todo"
        const seeAllButton = document.querySelector('[data-action="see-all-applied"]');
        if (seeAllButton) {
            seeAllButton.addEventListener('click', (event) => {
                event.preventDefault();
                // TODO: Implementar navegación a página de todos los trabajos aplicados
                console.log('Navegar a página de todos los trabajos aplicados');
            });
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
    loadRecentlyAppliedJobs,
    renderAppliedJobs,
    initProfileGeneralController,
    updateUserGreeting,
    updateStatsCards,
    formatDate,
    formatSalaryRange,
    getModalityBadge,
    getJobStatusBadge
};

// Inicializar el controlador
initProfileGeneralController();
