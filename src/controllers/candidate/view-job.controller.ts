import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { JobsService } from "@/services/jobsService.js";
import { ApplicationService } from "@/services/application.service.js";

import { CurriculumService } from "@/services/curriculumService.js";

import { ProfileCandidateService } from "@/services/profileCandidate.service.js";

export class ViewJobController {

    private jobs: Job[] = [];

    constructor() {
        this.init(); //Espera a que el documento esté cargado y carga tanto los datos de usuario como los trabajos
    }

    private init(): void {
        //Soluciona error desconocida de carga
        const runAll = async () => {
            await loadUserData();

            // Obtener el jobId de los parámetros URL o localStorage (fallback)
            const jobId = this.getJobIdFromURL();
            console.log("jobId obtenido:", jobId);

            if (jobId) {
                await this.loadJobs(jobId);
            } else {
                console.error("No se encontró el ID del trabajo en la URL");
                alert("No se pudo cargar el trabajo. ID no encontrado.");
                // Redirigir al home después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/src/pages/candidate/home.html';
                }, 2000);
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runAll);
        } else {
            runAll();
        }
    }

    /**
     * Obtiene el ID del trabajo desde los parámetros URL (?id=10)
     * También verifica localStorage como fallback
     */
    private getJobIdFromURL(): number | null {
        // Primero intentar obtener de los parámetros URL
        const urlParams = new URLSearchParams(window.location.search);
        const idFromURL = urlParams.get('id');

        if (idFromURL) {
            const jobId = Number(idFromURL);
            if (!isNaN(jobId) && jobId > 0) {
                return jobId;
            }
        }

        // Fallback: intentar obtener de localStorage (por compatibilidad)
        const idFromStorage = localStorage.getItem('jobId');
        if (idFromStorage) {
            const jobId = Number(idFromStorage);
            if (!isNaN(jobId) && jobId > 0) {
                console.warn("Usando jobId desde localStorage (método antiguo)");
                return jobId;
            }
        }

        return null;
    }

    //Carga los trabajos desde el servicio
    private async loadJobs(jobId: number): Promise<void> {
        try {
            let jobsResponse = await JobsService.getJobsById(jobId);
            if (!jobsResponse.success) {
                alert(jobsResponse.message);
                // Redirigir al home si no se encuentra el trabajo
                setTimeout(() => {
                    window.location.href = '/src/pages/candidate/home.html';
                }, 1500);
                return;
            }

            // Verificar que se obtuvieron datos
            if (!jobsResponse.data || jobsResponse.data.length === 0) {
                alert("No se encontró información del trabajo");
                setTimeout(() => {
                    window.location.href = '/src/pages/candidate/home.html';
                }, 1500);
                return;
            }

            this.jobs = jobsResponse.data;
            console.log("Datos del trabajo cargados:", this.jobs);

            this.renderJobs();
        } catch (error) {
            console.error("Error al obtener los trabajos:", error);
            alert("Error al cargar la información del trabajo");
            setTimeout(() => {
                window.location.href = '/src/pages/candidate/home.html';
            }, 1500);
        }
    }

    /**
     * Formatea una fecha para mostrarla en formato legible
     */
    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return date.toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    /**
     * Obtiene el badge apropiado según la modalidad
     */
    private getModalityBadge(modalidad: string): { className: string; text: string } {
        const modalidadLower = modalidad.toLowerCase();

        const badges: Record<string, { className: string; text: string }> = {
            'remoto': {
                className: 'badge bg-primary',
                text: 'Remoto'
            },
            'remote': {
                className: 'badge bg-primary',
                text: 'Remote'
            },
            'presencial': {
                className: 'badge bg-success',
                text: 'Presencial'
            },
            'onsite': {
                className: 'badge bg-success',
                text: 'On-site'
            },
            'híbrido': {
                className: 'badge bg-warning text-dark',
                text: 'Híbrido'
            },
            'hibrido': {
                className: 'badge bg-warning text-dark',
                text: 'Híbrido'
            },
            'hybrid': {
                className: 'badge bg-warning text-dark',
                text: 'Hybrid'
            },
            'tiempo completo': {
                className: 'badge bg-info',
                text: 'Tiempo Completo'
            },
            'full time': {
                className: 'badge bg-info',
                text: 'Full Time'
            }
        };

        return badges[modalidadLower] || {
            className: 'badge bg-secondary',
            text: modalidad
        };
    }

    public renderJobs(): void {
        const jobList = document.getElementById("jobDetails");
        const jobSideBar = document.getElementById("jobSideBar");

        if (!jobList || !jobSideBar) {
            console.error("No se encontraron los contenedores necesarios");
            return;
        }

        // Verificar que hay datos
        if (!this.jobs || this.jobs.length === 0) {
            jobList.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> No se encontró información del trabajo.
                </div>`;
            return;
        }

        const job = this.jobs[0];

        // Verificación adicional de que job existe
        if (!job) {
            jobList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar los datos del trabajo.
                </div>`;
            return;
        }

        const modalityBadge = this.getModalityBadge(job.modalidad);
        const formattedExpiration = this.formatDate(job.fecha_expiracion);

        // Información de la empresa
        const empresaNombre = job.empresa?.nombre || 'Empresa';
        const empresaLogo = job.empresa?.link_foto_perfil || '/src/assets/img/logo_grande.png';
        const categoriaNombre = job.categoria?.nombre_categoria || 'Sin categoría';

        // Limpiar contenedores
        jobList.innerHTML = "";
        jobSideBar.innerHTML = "";

        // Renderizar detalles del trabajo
        jobList.innerHTML = `
            <div class="job-header mb-4 d-flex align-items-center gap-3">
                <img src="${empresaLogo}" 
                     alt="Logo ${empresaNombre}" 
                     width="60" 
                     height="60" 
                     class="rounded"
                     onerror="this.src='/src/assets/img/logo_grande.png'">
                <div>
                    <h4 class="mb-1">${job.nombre_trabajo}</h4>
                    <small class="text-muted">
                        ${empresaNombre}
                        ${job.empresa?.ubicacion ? ` • ${job.empresa.ubicacion}` : job.ubicacion ? ` • ${job.ubicacion}` : ''}
                    </small><br>
                    <small class="text-muted">
                        <span class="${modalityBadge.className}">${modalityBadge.text}</span>
                        ${job.cupos ? ` • ${job.cupos} vacantes` : ''}
                        ${job.categoria ? ` • ${categoriaNombre}` : ''}
                    </small>
                </div>
            </div>
        
            <section class="mb-4">
                <h5 class="border-bottom pb-2 mb-3"><i class="bi bi-file-text me-2"></i>Descripción del trabajo</h5>
                <p class="text-justify" style="white-space: pre-wrap;">${job.descripcion || 'No especificada'}</p>
            </section>
        
            <section class="mb-4">
                <h5 class="border-bottom pb-2 mb-3"><i class="bi bi-list-check me-2"></i>Responsabilidades</h5>
                <div style="white-space: pre-wrap;">${job.responsabilidades || 'No especificadas'}</div>
            </section>

            ${job.aplicar_por ? `
            <section class="mb-4">
                <h5 class="border-bottom pb-2 mb-3"><i class="bi bi-envelope me-2"></i>Cómo Aplicar</h5>
                <p>${job.aplicar_por}</p>
            </section>` : ''}

            <button class="btn btn-primary w-100 mt-3" data-bs-toggle="modal" data-bs-target="#applyModal" onclick="viewJobController.loadCandidateCVs()">
                <i class="bi bi-send me-2"></i>Aplicar Ahora
            </button>`;

        // Renderizar sidebar
        jobSideBar.innerHTML = `
            <div class="section-card mb-3">
                <h5 class="mb-3"><i class="bi bi-info-circle me-2"></i>Detalles del Trabajo</h5>
                <ul class="list-unstyled job-meta">
                    ${job.fecha_publicacion ? `
                    <li class="mb-2">
                        <i class="bi bi-calendar-plus text-success me-2"></i>
                        <strong>Publicado:</strong> ${this.formatDate(job.fecha_publicacion)}
                    </li>` : ''}
                    <li class="mb-2">
                        <i class="bi bi-clock text-primary me-2"></i>
                        <strong>Expira:</strong> ${formattedExpiration}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-mortarboard text-primary me-2"></i>
                        <strong>Educación:</strong> ${job.educacion || 'No especificada'}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-cash-stack text-success me-2"></i>
                        <strong>Salario:</strong> $${job.salario_minimo?.toLocaleString()} - $${job.salario_maximo?.toLocaleString()}/mes
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-award text-warning me-2"></i>
                        <strong>Nivel:</strong> ${job.nivel || 'No especificado'}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-geo-alt text-danger me-2"></i>
                        <strong>Ubicación:</strong> ${job.ubicacion || 'No especificada'}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-briefcase text-info me-2"></i>
                        <strong>Modalidad:</strong> ${job.modalidad || 'No especificada'}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-star text-warning me-2"></i>
                        <strong>Experiencia:</strong> ${job.experiencia || 'No especificada'}
                    </li>
                    <li class="mb-2">
                        <i class="bi bi-people text-secondary me-2"></i>
                        <strong>Vacantes:</strong> ${job.cupos || 'No especificado'}
                    </li>
                </ul>
            </div>
        
            <div class="section-card">
                <h5 class="mb-3"><i class="bi bi-building me-2"></i>Sobre la Empresa</h5>
                ${job.empresa ? `
                    <div class="d-flex align-items-start mb-3">
                        ${job.empresa.link_foto_perfil ? `
                            <img src="${job.empresa.link_foto_perfil}" 
                                 alt="${job.empresa.nombre}" 
                                 width="60" 
                                 height="60" 
                                 class="rounded me-3"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${job.empresa.nombre}</h6>
                            ${job.empresa.ubicacion ? `<small class="text-muted"><i class="bi bi-geo-alt me-1"></i>${job.empresa.ubicacion}</small>` : ''}
                        </div>
                    </div>
                    
                    ${job.empresa.biografia ? `
                        <p class="small">${job.empresa.biografia}</p>
                    ` : ''}
                    
                    <ul class="list-unstyled small">
                        ${job.empresa.fecha_nacimiento_fundacion ? `
                            <li class="mb-1">
                                <i class="bi bi-calendar-event text-primary me-2"></i>
                                <strong>Fundada:</strong> ${new Date(job.empresa.fecha_nacimiento_fundacion).getFullYear()}
                            </li>
                        ` : ''}
                        ${job.empresa.email ? `
                            <li class="mb-1">
                                <i class="bi bi-envelope text-primary me-2"></i>
                                <strong>Email:</strong> <a href="mailto:${job.empresa.email}">${job.empresa.email}</a>
                            </li>
                        ` : ''}
                        ${job.empresa.telefono ? `
                            <li class="mb-1">
                                <i class="bi bi-telephone text-primary me-2"></i>
                                <strong>Teléfono:</strong> <a href="tel:${job.empresa.telefono}">${job.empresa.telefono}</a>
                            </li>
                        ` : ''}
                    </ul>
                    
                    ${job.empresa.pagina_web || job.empresa.red_social ? `
                        <div class="d-flex gap-2 mt-3">
                            ${job.empresa.pagina_web ? `
                                <a href="${job.empresa.pagina_web}" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   class="btn btn-sm btn-outline-primary flex-fill">
                                    <i class="bi bi-globe me-1"></i>Sitio Web
                                </a>
                            ` : ''}
                            ${job.empresa.red_social ? `
                                <a href="${job.empresa.red_social}" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   class="btn btn-sm btn-outline-info flex-fill">
                                    <i class="bi bi-linkedin me-1"></i>LinkedIn
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                ` : `
                    <p class="text-muted">
                        <small>ID Perfil: ${job.id_perfil}</small><br>
                        <small>Categoría: ${job.id_categoria}</small>
                    </p>
                    <p class="small text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        La información detallada de la empresa no está disponible.
                    </p>
                `}
            </div>
            
            ${job.categoria?.descripcion ? `
            <div class="section-card mt-3">
                <h6 class="mb-2"><i class="bi bi-tag me-2"></i>Categoría: ${job.categoria.nombre_categoria}</h6>
                <p class="small text-muted mb-0">${job.categoria.descripcion}</p>
            </div>
            ` : ''}`;
    }

    public async loadCandidateCVs() {
        const userProfile = await ProfileCandidateService.fetchCandidateProfile();
        if (userProfile.success && 'data' in userProfile){
            try {
        const result = await CurriculumService.fetchCurriculums(userProfile.data.id_perfil);

        if (result.success && 'data' in result) {
            console.log("CVs cargador", result.data);
            const modalContent = document.getElementById("applyModalContent");
            if(modalContent){
                const options = result.data.length
                        ? result.data.map(cv =>
                            `<option value="${cv.id_curriculum}">${cv.nombre_archivo}</option>`
                        ).join('')
                        : `<option disabled>No tienes CVs subidos</option>`;

                    modalContent.innerHTML = `
                    <div class="modal-content p-3">
                        <div class="modal-header">
                            <h5 class="modal-title" id="applyModalLabel">Aplicar al Trabajo</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <!-- Seleccionar CV -->
                                <div class="mb-3">
                                    <label for="cvSelect" class="form-label">Escoger Curriculum</label>
                                    <select class="form-select" id="cvSelect">
                                        <option selected disabled>Seleccionar Curriculum Subido</option>
                                        ${options}
                                    </select>
                                </div>
                                <!-- Descripción -->
                                <div class="mb-3">
                                    <label for="bioDescription" class="form-label">Descripción de biografía</label>
                                    <textarea class="form-control" id="bioDescription" rows="4" placeholder="Escribe quién eres, una descripción que quieras que los empleadores vean"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onClick="viewJobController.applyToJob()" data-bs-dismiss="modal">Aplicar Ahora <i class="bi bi-arrow-right"></i></button>
                        </div>
                    </div>
                    `;
            }

        } //else {
        //     const { renderCVList } = await import('@/lib/cvUpload');
        //     renderCVList([]);
        // }


    } catch (error) {
        console.error('Error loading CVs:', error);
    }
        }
        
}
    public async applyToJob(){
        const cvSelect =  (document.getElementById("cvSelect") as HTMLSelectElement);
        const bioDescription = (document.getElementById("bioDescription") as HTMLTextAreaElement);
        const userProfile = await ProfileCandidateService.fetchCandidateProfile();

        const jobId = this.getJobIdFromURL();

        if (jobId && cvSelect && bioDescription && userProfile.success && 'data' in userProfile) {
            const selectedCV = cvSelect.value;
            const mensaje = bioDescription.value;
            ApplicationService.postApplication(jobId, userProfile.data.id_perfil, parseInt(selectedCV), mensaje);
        } else {
            alert("No se pudo aplicar al trabajo. Faltan datos requeridos.");
        }
    }
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        viewJobController: ViewJobController;
    }
}

window.viewJobController = new ViewJobController();