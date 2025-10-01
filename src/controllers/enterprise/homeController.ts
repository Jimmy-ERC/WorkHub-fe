import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { ProfileEnterpriseService } from '@/services/profileEnterprise.service.js';
import type { ProfileResponse } from "@/interfaces/profileResponse.interface.js";
import { JobsService } from "@/services/jobsService.js";

export class EnterpriseHomeController {
    private jobs: Job[] = [];

    private filteredJobs: Job[] = [...this.jobs];

    constructor() {
        this.init(); //Espera a que el documento esté cargado y carga tanto los datos de usuario como los trabajos
    }

    private init(): void {
        //Soluciona error desconocida de carga
        const runAll = async () => {
            await loadUserData();
            await this.loadJobs();
            this.renderJobs();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runAll);
        } else {
            runAll();
        }
    }

    //Carga los trabajos desde el servicio
    private async loadJobs(): Promise<void> {
        let profileResponse =
            (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;

        if (!profileResponse.success) {
            alert(profileResponse.message);
            return;
        }

        const profileId = profileResponse.data.id_perfil;
        console.log("ID de perfil obtenido:", profileId);

        try {
            let jobsResponse = await JobsService.getJobsByProfileId(profileId);
            if (!jobsResponse.success) {
                alert(jobsResponse.message);
                return;
            }
            this.jobs = jobsResponse.data;
            this.filteredJobs = [...this.jobs];

            this.renderJobs();
        } catch (error) {
            console.error("Error al obtener los trabajos:", error);
        }
    }


    /**
     * Renderiza los trabajos para la página actual
     */
    public renderJobs(): void {
        const jobList = document.getElementById("jobList");
        if (!jobList) return;

        jobList.innerHTML = "";

        // Creamos row inicial
        jobList.innerHTML += `<div class="row py-2" style="justify-content: center; justify-self: center;"></div>`;

        for (let i = 0; i < this.filteredJobs.length; i++) {
            const job = this.filteredJobs[i];
            if (!job) continue;

            let colorBadge = "grey";
            if (job.modalidad === "Remota") {
                colorBadge = "blue";
            } else if (job.modalidad === "Híbrido" || job.modalidad === "Híbrida") {
                colorBadge = "red";
            } else {
                colorBadge = "green";
            }

            // Cambios para trabajos cerrados
            const isClosed = job.estado === false;
            const lockIcon = isClosed ? `<i class="bi bi-lock-fill" style="margin-right: 6px;"></i>` : "";
            const cardOpacity = isClosed ? "0.5" : "1";
            const titleStyle = isClosed ? "text-decoration: line-through;" : "";
            const pointerEvents = isClosed ? "pointer-events: none;" : "";

            const lastRow = jobList.querySelector(".row:last-child");
            if (lastRow) {
                lastRow.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id_trabajo})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                    style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; opacity: ${cardOpacity}; ${pointerEvents}">

                    <div class="card-body">
                        <div class="d-flex" style="text-align: center; justify-content: space-between; width: 100%;">
                            <h5 class="card-title" style="${titleStyle}">${lockIcon}${job.nombre_trabajo}</h5>
                            <span class="badge text-bg-secondary"
                            style="border-radius: 44px; text-align: center; padding-bottom: 0; display: inline-flex; align-items: center; background-color:${colorBadge}!important "> 
                                <p style="margin: 0;">${job.modalidad}</p>
                            </span>
                        </div>
                        <p class="card-text">${job.nivel} - $${job.salario_minimo}–${job.salario_maximo}</p>
                        <p class="card-text"><i class="bi bi-geo-alt"></i>${job.ubicacion}.</p>
                    </div>
                </button>`;
            }

            if ((i + 1) % 3 === 0) {
                jobList.innerHTML += `<div class="row p-2" style="justify-content: center; justify-self: center;"></div>`;
            }
        }
    }

    /**
     * Filtra trabajos por fecha y actualiza la vista
     */
    public filtrarTrabajos(): void {
        const ordenFechaElement = document.getElementById(
            "ordenFecha"
        ) as HTMLSelectElement;
        if (!ordenFechaElement) return;

        const ordenFecha = ordenFechaElement.value;

        // Filtramos por fecha de expiración
        if (ordenFecha === "recientes") {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return (
                    new Date(b.fecha_expiracion).getTime() -
                    new Date(a.fecha_expiracion).getTime()
                );
            });
        } else {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return (
                    new Date(a.fecha_expiracion).getTime() -
                    new Date(b.fecha_expiracion).getTime()
                );
            });
        }
        this.renderJobs();
    }

    public llenarModalDetalleTrabajo(idTrabajo: number) {
        const trabajo = this.jobs.find(t => t.id_trabajo === idTrabajo);
        console.log(trabajo);

        // Llenar los elementos del modal con los datos del trabajo
        document.getElementById("modalTitulo")!.textContent = trabajo!.nombre_trabajo;
        document.getElementById("modalDescripcion")!.textContent = trabajo!.descripcion;
        document.getElementById("modalModalidad")!.textContent = trabajo!.modalidad;
        document.getElementById("modalUbicacion")!.textContent = trabajo!.ubicacion;

        //enviar el nombre del trabajo al botón ver candidatos
        document.getElementById('btnVerCandidatos')!.addEventListener('click', () => verCandidatos(trabajo?.id_trabajo));

        document.getElementById("btnCerrarVacante")!.setAttribute('data-job-id', trabajo!.id_trabajo.toString());

        //asignamos el evento al botón confirmar cerrar vacante
        document.getElementById("btnConfirmarCerrarVacante")?.addEventListener('click', () => this.cerrarVacante(trabajo!.id_trabajo));

    }

    public async cerrarVacante(idTrabajo: number) {
        console.log("Cerrando vacante con ID:", idTrabajo);

        const response = await JobsService.deleteJobById(idTrabajo);
        if (!response.success) {
            alert(response.message);
            return;
        }
        this.loadJobs();

    }
}

function verCandidatos(puesto: any) {
    // Redirigir a la página de ver candidatos con el puesto seleccionado
    window.location.href = `/src/pages/enterprise/view-candidates.html?puesto=${encodeURIComponent(
        puesto
    )}`;
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseHomeController: EnterpriseHomeController;
    }
}

window.enterpriseHomeController = new EnterpriseHomeController();
