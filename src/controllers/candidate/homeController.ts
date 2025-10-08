import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { JobsService } from "@/services/jobsService.js";
import { FavoriteJobsService } from "@/services/favoriteJobs.service.js";
import { ProfileCandidateService } from "@/services/profileCandidate.service.js";
import { toast } from "@/lib/toast.js";


export class CandidateHomeController {

    private jobs: Job[] = [];
    private filteredJobs: Job[] = [...this.jobs];
    private currentProfileId: number | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        //Soluciona error desconocida de carga
        const runAll = async () => {
            await loadUserData();
            await this.loadProfileId();
            await this.loadJobs();
            //this.renderJobs();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runAll);
        } else {
            runAll();
        }
    }

    // Obtener el ID del perfil del candidato
    private async loadProfileId(): Promise<void> {
        try {
            const profileResponse = await ProfileCandidateService.fetchCandidateProfile();
            
            if (profileResponse.success && 'data' in profileResponse) {
                this.currentProfileId = profileResponse.data.id_perfil;
                console.log("ID de perfil cargado:", this.currentProfileId);
            } else {
                console.error("No se pudo obtener el perfil del candidato:", profileResponse.message);
            }
        } catch (error) {
            console.error("Error al obtener perfil del candidato:", error);
        }
    }

    //Carga los trabajos desde el servicio
    private async loadJobs(): Promise<void> {
        // let profileResponse =
        //     (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;

        // if (!profileResponse.success) {
        //     alert(profileResponse.message);
        //     return;
        // }

        // const profileId = profileResponse.data.id_perfil;
        // console.log("ID de perfil obtenido:", profileId);

        try {
            let jobsResponse = await JobsService.getJobsActive();
            if (!jobsResponse.success) {
                alert(jobsResponse.message);
                return;
            }
            this.jobs = jobsResponse.data;
            this.filteredJobs = [...this.jobs];

            console.log("this.jobs:", this.jobs);
            console.log("this.filteredJobs:", this.filteredJobs);

            this.renderJobs();
        } catch (error) {
            console.error("Error al obtener los trabajos:", error);
        }
    }

    public renderJobs(): void {
        const jobList = document.getElementById("jobList");
        if (!jobList) return;

        jobList.innerHTML = "";

        // Creamos row inicial
        jobList.innerHTML += `<div class="row py-2" style="justify-content: center; justify-self: center;"></div>`;

        for (let i = 0; i < this.filteredJobs.length; i++) {
            const job = this.filteredJobs[i];
            if (!job) continue;

            
            const lastRow = jobList.querySelector(".row:last-child");
            if (lastRow) {

                console.log("id", job.id_trabajo);

                // Logo de la empresa o placeholder
                const logoEmpresa = job.logo_empresa
                    ? `<img src="${job.logo_empresa}" class="me-3 rounded" alt="${job.nombre_empresa || 'Logo empresa'}" width="50" height="50" style="object-fit: cover; border: 1px solid #e0e0e0;">`
                    : `<div class="me-3 rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: #f5f5f5; border: 1px solid #e0e0e0; font-size: 24px;">🏢</div>`;

                const nombreEmpresa = job.nombre_empresa || 'Empresa no especificada';

                lastRow.innerHTML += `
            <div class="list-group-item job-card d-flex justify-content-between align-items-center p-3 mb-2">
                <div class="d-flex align-items-center">
                    ${logoEmpresa}
                    <div>
                        <h6 class="mb-0 fw-bold">${job.nombre_trabajo}</h6>
                        <small class="text-muted d-block">${nombreEmpresa}</small>
                        <small class="text-muted">${job.ubicacion} • $${job.salario_minimo}–$${job.salario_maximo}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-bookmark save-icon" 
                       data-job-id="${job.id_trabajo}" 
                       role="button"
                       aria-label="Agregar a favoritos"
                       tabindex="0"></i>
                    <a href="/src/pages/candidate/view-job.html?id=${job.id_trabajo}" class="btn apply-btn btn-sm">Apply Now →</a>
                </div>
            </div>`;
            }

            if ((i + 1) % 3 === 0) {
                jobList.innerHTML += `<div class="row p-2" style="justify-content: center; justify-self: center;"></div>`;
            }
        }

        // Agregar event listeners a los iconos de favorito
        this.attachFavoriteListeners();
    }

    // Agregar event listeners a los iconos de favorito
    private attachFavoriteListeners(): void {
        const saveIcons = document.querySelectorAll('.save-icon');
        saveIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const jobId = parseInt(target.getAttribute('data-job-id') || '0');
                if (jobId) {
                    this.handleAddToFavorites(jobId, target);
                }
            });
        });
    }

    // Manejar la adición a favoritos
    private async handleAddToFavorites(jobId: number, iconElement: HTMLElement): Promise<void> {
        // Validar que tenemos el ID del perfil
        if (!this.currentProfileId) {
            toast.error('No se pudo obtener tu perfil. Por favor, recarga la página.');
            return;
        }

        // Verificar si ya está guardado
        if (iconElement.classList.contains('saved')) {
            toast.info('Este trabajo ya está en tus favoritos');
            return;
        }

        // Cambiar a estado loading (guardar clases originales)
        const originalClasses = iconElement.className;
        iconElement.className = 'spinner-border spinner-border-sm loading';

        try {
            const result = await FavoriteJobsService.addFavorite({
                id_perfil: this.currentProfileId,
                id_trabajo: jobId
            });

            if (result.success) {
                // Cambiar icono a guardado (bookmark-fill)
                iconElement.className = 'bi bi-bookmark-fill save-icon saved';
                
                // Mostrar toast de éxito
                toast.success(
                    'Trabajo agregado a favoritos exitosamente. Puedes consultarlo en tu perfil.',
                    '¡Guardado!'
                );
            } else {
                // Si es error de duplicado, marcar como guardado
                if (result.message.includes('ya está en tus favoritos')) {
                    iconElement.className = 'bi bi-bookmark-fill save-icon saved';
                    toast.warning('Este trabajo ya está en tus favoritos');
                } else {
                    // Restaurar estado original
                    iconElement.className = originalClasses;
                    toast.error(result.message || 'Error al agregar favorito');
                }
            }
        } catch (error) {
            // Error de red u otro - restaurar estado original
            iconElement.className = originalClasses;
            console.error('Error al agregar favorito:', error);
            toast.error('Error al conectar con el servidor. Inténtalo de nuevo.');
        }
    }

    public filtrarPorBusqueda(): void {
        const tituloBuscar = (
            document.getElementById("tituloBuscar") as HTMLInputElement
        ).value.toLowerCase();
        const ubicacionBuscar = (
            document.getElementById("ubicacionBuscar") as HTMLInputElement
        ).value.toLowerCase();
        const salarioBuscar = (
            document.getElementById("salarioBuscar") as HTMLInputElement
        ).value;

        const salaryRadio = document.querySelector<HTMLInputElement>('input[name="salary"]:checked');
        let salarioMin = 0;
        let salarioMax = 0;

        const tiposSeleccionados: string[] = [];
        if ((document.getElementById("tipoBuscarTiempoCompleto") as HTMLInputElement)?.checked) {
            tiposSeleccionados.push("Tiempo Completo");
        }
        if ((document.getElementById("tipoBuscarMedioTiempo") as HTMLInputElement)?.checked) {
            tiposSeleccionados.push("Medio Tiempo");
        }
        if ((document.getElementById("tipoBuscarRemoto") as HTMLInputElement)?.checked) {
            tiposSeleccionados.push("Remoto");
        }

        const nivelSeleccionados: string[] = [];
        if ((document.getElementById("nivelJunior") as HTMLInputElement)?.checked) {
            nivelSeleccionados.push("Junior");
        }
        if ((document.getElementById("nivelIntermedio") as HTMLInputElement)?.checked) {
            nivelSeleccionados.push("Intermedio");
        }
        if ((document.getElementById("nivelSenior") as HTMLInputElement)?.checked) {
            nivelSeleccionados.push("Senior");
        }

        console.log("Buscando por:", {
            tituloBuscar,
            ubicacionBuscar,
            salarioBuscar
        });

        if (salaryRadio) {
            // Extrae los números del texto "$2000 - $4000"
            const match = salaryRadio.nextSibling?.textContent?.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
            if (match && match[1] && match[2]) {
                salarioMin = parseInt(match[1], 10);
                salarioMax = parseInt(match[2], 10);
            }
        }

        this.filteredJobs = this.jobs.filter((job) => {
            const matchesTitulo = job.nombre_trabajo
                .toLowerCase()
                .includes(tituloBuscar);
            const matchesUbicacion = job.ubicacion
                .toLowerCase()
                .includes(ubicacionBuscar);
            const matchesSalario = salarioBuscar
                ? job.salario_minimo <= parseInt(salarioBuscar) &&
                job.salario_maximo >= parseInt(salarioBuscar)
                : true;
            const matchesTipo = tiposSeleccionados.length === 0 || tiposSeleccionados.includes(job.modalidad);
            const matchesNivel = nivelSeleccionados.length === 0 || nivelSeleccionados.includes(job.nivel);
            const matchesSalarioRango = salarioMin && salarioMax
                ? job.salario_minimo <= salarioMin &&
                job.salario_maximo >= salarioMax
                : true;

            return matchesTitulo && matchesUbicacion && matchesSalario && matchesTipo && matchesSalarioRango && matchesNivel;
        });
        this.renderJobs();
    }
}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        candidateHomeController: CandidateHomeController;
    }
}

window.candidateHomeController = new CandidateHomeController();