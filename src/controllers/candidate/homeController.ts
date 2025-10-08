import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { JobsService } from "@/services/jobsService.js";



// import { sessionManager } from '../../lib/session.js';


export class CandidateHomeController {

    private jobs: Job[] = [];

    private filteredJobs: Job[] = [...this.jobs];

    constructor() {
        this.init();
    }

    private init(): void {
        //Soluciona error desconocida de carga
        const runAll = async () => {
            await loadUserData();
            await this.loadJobs();
            //this.renderJobs();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runAll);
        } else {
            runAll();
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

            let colorBadge = "grey";
            if (job.modalidad === "Remota") {
                colorBadge = "blue";
            } else if (job.modalidad === "Híbrido" || job.modalidad === "Híbrida") {
                colorBadge = "red";
            } else {
                colorBadge = "green";
            }

            // Cambios para trabajos cerrados
            // const isClosed = job.estado === false;
            // const lockIcon = isClosed ? `<i class="bi bi-lock-fill" style="margin-right: 6px;"></i>` : "";
            // const cardOpacity = isClosed ? "0.5" : "1";
            // const titleStyle = isClosed ? "text-decoration: line-through;" : "";
            // const pointerEvents = isClosed ? "pointer-events: none;" : "";

            const lastRow = jobList.querySelector(".row:last-child");
            if (lastRow) {
                // lastRow.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id_trabajo})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                //     style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; opacity: ${cardOpacity}; ${pointerEvents}">

                //     <div class="card-body">
                //         <div class="d-flex" style="text-align: center; justify-content: space-between; width: 100%;">
                //             <h5 class="card-title" style="${titleStyle}">${lockIcon}${job.nombre_trabajo}</h5>
                //             <span class="badge text-bg-secondary"
                //             style="border-radius: 44px; text-align: center; padding-bottom: 0; display: inline-flex; align-items: center; background-color:${colorBadge}!important "> 
                //                 <p style="margin: 0;">${job.modalidad}</p>
                //             </span>
                //         </div>
                //         <p class="card-text">${job.nivel} - $${job.salario_minimo}–${job.salario_maximo}</p>
                //         <p class="card-text"><i class="bi bi-geo-alt"></i>${job.ubicacion}.</p>
                //     </div>
                // </button>`;

                console.log("id", job.id_trabajo);

                lastRow.innerHTML += `
            <div class="list-group-item job-card d-flex justify-content-between align-items-center p-3 mb-2">
                <div class="d-flex align-items-center">
                    <img src="#" class="me-3" alt="icon" width="40">
                    <div>
                        <h6 class="mb-1 fw-bold">${job.nombre_trabajo}</h6>
                        <small class="text-muted">${job.ubicacion} • $${job.salario_minimo}–$${job.salario_maximo}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-bookmark save-icon"></i>
                    <a href="/src/pages/candidate/view-job.html?id=${job.id_trabajo}" class="btn apply-btn btn-sm">Apply Now →</a>
                </div>
            </div>`;
            }

            if ((i + 1) % 3 === 0) {
                jobList.innerHTML += `<div class="row p-2" style="justify-content: center; justify-self: center;"></div>`;
            }
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

        const expRadio = document.querySelector<HTMLInputElement>('input[name="exp"]:checked');
        const experiencia = expRadio ? expRadio.nextSibling?.textContent?.trim() : null;
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