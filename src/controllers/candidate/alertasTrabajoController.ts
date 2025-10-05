import { AlertasTrabajoService } from '@/services/alertasTrabajo.service';
import { ProfileGeneralCandidateService } from '@/services/profileGeneralCandidate.service';
import type { Datum } from '@/interfaces/alertasTrabajo.interface';

// Estado global del controlador
let allAlerts: Datum[] = [];
let filteredAlerts: Datum[] = [];

/**
 * Formatea una fecha de forma relativa (ej: "hace 2 horas", "hace 3 días")
 */
function formatRelativeDate(dateString: Date | string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) {
            return 'Hace un momento';
        } else if (diffMins < 60) {
            return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
        } else {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            return date.toLocaleDateString('es-ES', options);
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha no disponible';
    }
}

/**
 * Obtiene el ícono según el tipo de notificación
 */
function getNotificationIcon(tipo: string): { iconClass: string; colorClass: string } {
    const tipoLower = tipo.toLowerCase();

    const icons: Record<string, { iconClass: string; colorClass: string }> = {
        'aplicacion': {
            iconClass: 'bi-briefcase-fill',
            colorClass: 'text-primary'
        },
        'actualizacion': {
            iconClass: 'bi-arrow-repeat',
            colorClass: 'text-info'
        },
        'expiracion': {
            iconClass: 'bi-clock-fill',
            colorClass: 'text-warning'
        },
        'aceptado': {
            iconClass: 'bi-check-circle-fill',
            colorClass: 'text-success'
        },
        'rechazado': {
            iconClass: 'bi-x-circle-fill',
            colorClass: 'text-danger'
        }
    };

    return icons[tipoLower] || {
        iconClass: 'bi-bell-fill',
        colorClass: 'text-secondary'
    };
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
 * Crea el HTML para una alerta
 */
function createAlertHTML(alert: Datum): string {
    const notificationIcon = getNotificationIcon(alert.tipo);
    const formattedDate = formatRelativeDate(alert.enviado_en);
    const formattedSalary = formatSalaryRange(alert.salario_minimo, alert.salario_maximo);
    const logoUrl = alert.logo_empresa || '/src/assets/img/logo_grande.png';
    
    // Clase para alertas no leídas
    const unreadClass = !alert.leido ? 'bg-light border-start border-primary border-3' : '';

    // Toggle button para marcar como leído/no leído
    const toggleButton = `
        <button class="btn btn-sm border-0 p-0 d-flex align-items-center justify-content-center rounded-circle toggle-read-btn" 
                type="button" 
                data-action="toggle-read" 
                data-alert-id="${alert.id_notificacion}" 
                data-current-status="${alert.leido}"
                title="${alert.leido ? 'Marcar como no leída' : 'Marcar como leída'}"
                style="width: 32px; height: 32px; transition: all 0.2s ease;">
            ${alert.leido 
                ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>' 
                : '<i class="bi bi-circle text-muted fs-5"></i>'
            }
        </button>
    `;

    return `
        <article class="list-group-item list-group-item-action ${unreadClass}" 
                 data-alert-id="${alert.id_notificacion}" 
                 data-job-id="${alert.id_trabajo}"
                 data-read="${alert.leido}"
                 style="transition: all 0.3s ease;">
            <div class="d-flex gap-3 align-items-start">
                <!-- Ícono de notificación -->
                <div class="flex-shrink-0">
                    <div class="rounded-circle bg-white border d-flex align-items-center justify-content-center" 
                         style="width: 48px; height: 48px;">
                        <i class="bi ${notificationIcon.iconClass} ${notificationIcon.colorClass} fs-5"></i>
                    </div>
                </div>

                <!-- Contenido de la alerta -->
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                ${alert.tipo.charAt(0).toUpperCase() + alert.tipo.slice(1)}
                                ${!alert.leido ? '<span class="badge bg-primary ms-2">Nuevo</span>' : ''}
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>${formattedDate}
                            </small>
                        </div>
                        ${toggleButton}
                    </div>

                    <!-- Mensaje -->
                    <p class="mb-2">${alert.mensaje}</p>

                    <!-- Información del trabajo -->
                    <div class="card border-0 bg-body-tertiary">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-start gap-3">
                                <img src="${logoUrl}" class="rounded border" 
                                     alt="Logo ${alert.nombre_empresa}" 
                                     width="40" height="40"
                                     onerror="this.src='/src/assets/img/logo_grande.png'">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">
                                        <a href="#" class="link-dark text-decoration-none" 
                                           data-action="view-job" data-job-id="${alert.id_trabajo}">
                                            ${alert.nombre_trabajo}
                                        </a>
                                    </h6>
                                    <div class="text-muted small">
                                        <span class="me-3">
                                            <i class="bi bi-building me-1"></i>${alert.nombre_empresa}
                                        </span>
                                        <span class="me-3">
                                            <i class="bi bi-geo-alt me-1"></i>${alert.ubicacion}
                                        </span>
                                        <span class="me-3">
                                            <i class="bi bi-briefcase me-1"></i>${alert.modalidad}
                                        </span>
                                        <span>
                                            <i class="bi bi-cash-coin me-1"></i>${formattedSalary}/mes
                                        </span>
                                    </div>
                                </div>
                                <div class="text-end">
                                    ${alert.estado_trabajo ? 
                                        '<span class="badge bg-success-subtle text-success border border-success">Activo</span>' : 
                                        '<span class="badge bg-danger-subtle text-danger border border-danger">Cerrado</span>'
                                    }
                                </div>
                            </div>
                        </div>
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
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-3">Cargando alertas...</p>
        </div>
    `;
}

/**
 * Muestra un mensaje cuando no hay alertas
 */
function showEmptyState(): void {
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-bell-slash fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">No tienes alertas de trabajo</h5>
            <p class="text-muted">Aquí aparecerán las notificaciones sobre tus aplicaciones y actualizaciones de trabajos.</p>
            <a href="/src/pages/candidate/home.html" class="btn btn-primary mt-3">
                <i class="bi bi-search me-2"></i>Explorar trabajos
            </a>
        </div>
    `;

    // Actualizar contadores
    updateAlertCounts(0, 0);
}

/**
 * Muestra un mensaje cuando no hay resultados con los filtros actuales
 */
function showNoResultsState(): void {
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-funnel fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-muted">No se encontraron alertas</h5>
            <p class="text-muted">Intenta ajustar los filtros para ver más alertas.</p>
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
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>${message}</div>
        </div>
    `;
}

/**
 * Actualiza los contadores de alertas
 */
function updateAlertCounts(total: number, unread: number): void {
    const totalElement = document.getElementById('totalAlertsCount');
    const unreadElement = document.getElementById('unreadAlertsCount');
    const sidebarBadge = document.getElementById('jobAlertsCount');

    if (totalElement) {
        totalElement.textContent = total.toString();
    }

    if (unreadElement) {
        unreadElement.textContent = `${unread} sin leer`;
        // Mostrar/ocultar según haya alertas no leídas
        if (unread > 0) {
            unreadElement.classList.remove('d-none');
        } else {
            unreadElement.classList.add('d-none');
        }
    }

    if (sidebarBadge) {
        sidebarBadge.textContent = unread > 0 ? unread.toString().padStart(2, '0') : '00';
    }
}

/**
 * Renderiza la lista de alertas
 */
function renderAlerts(alerts: Datum[]): void {
    const container = document.getElementById('alertsListContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    if (alerts.length === 0) {
        // Si no hay alertas en absoluto, mostrar empty state
        if (allAlerts.length === 0) {
            showEmptyState();
        } else {
            // Si hay alertas pero los filtros no devuelven resultados
            showNoResultsState();
        }
        return;
    }

    // Renderizar todas las alertas
    container.innerHTML = alerts.map(alert => createAlertHTML(alert)).join('');

    // Contar alertas no leídas
    const unreadCount = AlertasTrabajoService.countUnreadAlerts(alerts);

    // Actualizar contadores
    updateAlertCounts(alerts.length, unreadCount);

    // Agregar event listeners
    attachAlertListeners();
}

/**
 * Agrega event listeners a las alertas
 */
function attachAlertListeners(): void {
    // Event listeners para ver detalles del trabajo
    const viewJobButtons = document.querySelectorAll('[data-action="view-job"]');
    viewJobButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const jobId = (button as HTMLElement).dataset.jobId;
            if (jobId) {
                window.location.href = `/src/pages/candidate/view-job.html?id=${jobId}`;
            }
        });
    });

    // Event listeners para toggle de estado leído/no leído
    const toggleReadButtons = document.querySelectorAll('[data-action="toggle-read"]');
    toggleReadButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const alertId = (button as HTMLElement).dataset.alertId;
            const currentStatus = (button as HTMLElement).dataset.currentStatus === 'true';
            
            if (alertId) {
                // Cambiar al estado opuesto
                await toggleAlertReadStatus(parseInt(alertId), !currentStatus);
            }
        });

        // Efecto hover en el botón
        button.addEventListener('mouseenter', () => {
            button.classList.add('shadow-sm');
        });
        button.addEventListener('mouseleave', () => {
            button.classList.remove('shadow-sm');
        });
    });
}

/**
 * Cambia el estado de lectura de una alerta (toggle)
 */
async function toggleAlertReadStatus(alertId: number, newReadStatus: boolean): Promise<void> {
    try {
        // Mostrar estado de carga en el botón
        const button = document.querySelector(`[data-action="toggle-read"][data-alert-id="${alertId}"]`);
        if (button) {
            button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            (button as HTMLButtonElement).disabled = true;
        }

        // Llamar al servicio para actualizar en el servidor
        const response = await AlertasTrabajoService.toggleReadStatus(alertId, newReadStatus);

        if (!response.success) {
            showErrorToast(response.message);
            // Revertir el cambio visual si falló
            if (button) {
                (button as HTMLButtonElement).disabled = false;
            }
            return;
        }

        // Actualizar localmente
        const alert = allAlerts.find(a => a.id_notificacion === alertId);
        if (alert) {
            alert.leido = newReadStatus;
        }

        // Recargar la vista aplicando los filtros actuales
        await loadAllAlerts();

        // Mostrar mensaje de éxito
        showSuccessToast(response.message);

    } catch (error) {
        console.error('Error toggling alert read status:', error);
        showErrorToast('Error al actualizar el estado de la alerta');
        
        // Recargar en caso de error para mantener consistencia
        await loadAllAlerts();
    }
}

/**
 * Marca todas las alertas como leídas
 */
async function markAllAlertsAsRead(): Promise<void> {
    try {
        // Obtener IDs de todas las alertas no leídas
        const unreadAlertIds = allAlerts
            .filter(alert => !alert.leido)
            .map(alert => alert.id_notificacion);

        if (unreadAlertIds.length === 0) {
            showSuccessToast('No hay alertas sin leer');
            return;
        }

        // Deshabilitar el botón mientras se procesa
        const markAllBtn = document.getElementById('markAllAsReadBtn') as HTMLButtonElement;
        if (markAllBtn) {
            markAllBtn.disabled = true;
            markAllBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Marcando...';
        }

        // Llamar al servicio para marcar todas como leídas
        const response = await AlertasTrabajoService.markAllAsRead(unreadAlertIds);

        if (!response.success) {
            showErrorToast(response.message);
            if (markAllBtn) {
                markAllBtn.disabled = false;
                markAllBtn.innerHTML = '<i class="bi bi-check-all me-1"></i>Marcar todas como leídas';
            }
            return;
        }

        // Actualizar localmente
        allAlerts.forEach(alert => {
            if (unreadAlertIds.includes(alert.id_notificacion)) {
                alert.leido = true;
            }
        });

        // Recargar la vista
        await loadAllAlerts();

        // Restaurar el botón
        if (markAllBtn) {
            markAllBtn.disabled = false;
            markAllBtn.innerHTML = '<i class="bi bi-check-all me-1"></i>Marcar todas como leídas';
        }

        // Mostrar mensaje de éxito
        showSuccessToast(response.message);

    } catch (error) {
        console.error('Error marking all alerts as read:', error);
        showErrorToast('Error al marcar las alertas como leídas');
        
        // Restaurar el botón
        const markAllBtn = document.getElementById('markAllAsReadBtn') as HTMLButtonElement;
        if (markAllBtn) {
            markAllBtn.disabled = false;
            markAllBtn.innerHTML = '<i class="bi bi-check-all me-1"></i>Marcar todas como leídas';
        }
        
        // Recargar en caso de error
        await loadAllAlerts();
    }
}

/**
 * Muestra un toast de éxito
 */
function showSuccessToast(message: string): void {
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
 * Aplica los filtros seleccionados
 */
function applyFilters(): void {
    const readStatusFilter = (document.getElementById('filterReadStatus') as HTMLSelectElement)?.value || 'all';
    const typeFilter = (document.getElementById('filterType') as HTMLSelectElement)?.value || 'all';

    // Iniciar con todas las alertas
    let filtered = [...allAlerts];

    // Aplicar filtro de estado de lectura
    if (readStatusFilter !== 'all') {
        filtered = AlertasTrabajoService.filterByReadStatus(filtered, readStatusFilter);
    }

    // Aplicar filtro de tipo
    if (typeFilter !== 'all') {
        filtered = AlertasTrabajoService.filterByType(filtered, typeFilter);
    }

    // NO ordenar aquí - mantener el orden del backend (no leídas primero, luego por fecha)
    // filtered = AlertasTrabajoService.sortByDate(filtered, true);

    // Actualizar estado y renderizar
    filteredAlerts = filtered;
    renderAlerts(filteredAlerts);
}

/**
 * Limpia todos los filtros
 */
function clearFilters(): void {
    const readStatusSelect = document.getElementById('filterReadStatus') as HTMLSelectElement;
    const typeSelect = document.getElementById('filterType') as HTMLSelectElement;

    if (readStatusSelect) readStatusSelect.value = 'all';
    if (typeSelect) typeSelect.value = 'all';

    applyFilters();
}

/**
 * Inicializa los event listeners para los filtros
 */
function initFilterListeners(): void {
    const readStatusFilter = document.getElementById('filterReadStatus');
    const typeFilter = document.getElementById('filterType');
    const markAllAsReadBtn = document.getElementById('markAllAsReadBtn');

    if (readStatusFilter) {
        readStatusFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }

    if (markAllAsReadBtn) {
        markAllAsReadBtn.addEventListener('click', async () => {
            const confirmed = confirm('¿Estás seguro de que deseas marcar todas las alertas como leídas?');
            if (confirmed) {
                await markAllAlertsAsRead();
            }
        });
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
 * Carga todas las alertas
 */
async function loadAllAlerts(): Promise<void> {
    try {
        // Mostrar estado de carga
        showLoadingState();

        // Llamar al servicio para obtener los datos
        const response = await AlertasTrabajoService.fetchAllAlerts();

        if (!response.success) {
            showError(response.message);
            return;
        }

        // Guardar las alertas en el estado global
        allAlerts = response.data || [];
        filteredAlerts = [...allAlerts];

        // NO ordenar aquí - el backend ya envía el orden correcto (no leídas primero)
        // filteredAlerts = AlertasTrabajoService.sortByDate(filteredAlerts, true);

        // Renderizar las alertas
        renderAlerts(filteredAlerts);

    } catch (error) {
        console.error('Error loading alerts:', error);
        showError('Hubo un error al cargar las alertas. Por favor, intenta de nuevo.');
    }
}

/**
 * Inicializa el controlador de alertas de trabajo
 */
function initAlertasTrabajoController(): void {
    const initializeController = async () => {
        try {
            console.log('Inicializando controlador de alertas de trabajo...');

            // Inicializar filtros
            initFilterListeners();

            // Cargar todas las alertas
            await loadAllAlerts();

            // Actualizar el badge de alertas en el sidebar
            await updateAlertsBadge();

            console.log('Controlador de alertas de trabajo inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar el controlador de alertas de trabajo:', error);
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
    loadAllAlerts,
    renderAlerts,
    applyFilters,
    clearFilters,
    toggleAlertReadStatus,
    markAllAlertsAsRead,
    initAlertasTrabajoController,
    formatRelativeDate
};

// Inicializar el controlador
initAlertasTrabajoController();
