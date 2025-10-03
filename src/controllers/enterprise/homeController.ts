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

        // Separar trabajos abiertos y cerrados
        const openJobs = this.filteredJobs.filter(job => job.estado);
        const closedJobs = this.filteredJobs.filter(job => !job.estado);

        // Renderizar trabajos abiertos
        if (openJobs.length > 0) {
            jobList.innerHTML += `<h4 class="mt-3 mb-2">Vacantes abiertas</h4>`;
            jobList.innerHTML += `<div class="row py-2" id="openJobsRow" style="justify-content: center; justify-self: center;"></div>`;
            const openJobsRow = jobList.querySelector("#openJobsRow");
            openJobs.forEach((job, i) => {
                let colorBadge = "grey";
                if (job.modalidad === "Remota") {
                    colorBadge = "blue";
                } else if (job.modalidad === "Híbrido" || job.modalidad === "Híbrida") {
                    colorBadge = "red";
                } else {
                    colorBadge = "green";
                }
                openJobsRow!.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id_trabajo})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                    style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; opacity: 1;">
                    <div class="card-body">
                        <div class="d-flex" style="text-align: center; justify-content: space-between; width: 100%;">
                            <h5 class="card-title">${job.nombre_trabajo}</h5>
                            <span class="badge text-bg-secondary"
                            style="border-radius: 44px; text-align: center; padding-bottom: 0; display: inline-flex; align-items: center; background-color:${colorBadge}!important "> 
                                <p style="margin: 0;">${job.modalidad}</p>
                            </span>
                        </div>
                        <p class="card-text">${job.nivel} - $${job.salario_minimo}–${job.salario_maximo}</p>
                        <p class="card-text"><i class="bi bi-geo-alt"></i>${job.ubicacion}.</p>
                    </div>
                </button>`;
                if ((i + 1) % 3 === 0 && i !== openJobs.length - 1) {
                    openJobsRow!.innerHTML += `<div class="w-100"></div>`;
                }
            });
        }

        // Renderizar trabajos cerrados
        if (closedJobs.length > 0) {
            jobList.innerHTML += `<h4 class="mt-4 mb-2 text-secondary">Vacantes cerradas</h4>`;
            jobList.innerHTML += `<div class="row py-2" id="closedJobsRow" style="justify-content: center; justify-self: center;"></div>`;
            const closedJobsRow = jobList.querySelector("#closedJobsRow");
            closedJobs.forEach((job, i) => {
                let colorBadge = "grey";
                if (job.modalidad === "Remota") {
                    colorBadge = "blue";
                } else if (job.modalidad === "Híbrido" || job.modalidad === "Híbrida") {
                    colorBadge = "red";
                } else {
                    colorBadge = "green";
                }
                const lockIcon = `<i class="bi bi-lock-fill" style="margin-right: 6px;"></i>`;
                closedJobsRow!.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id_trabajo})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                    style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; opacity: 0.8;">
                    <div class="card-body">
                        <div class="d-flex" style="text-align: center; justify-content: space-between; width: 100%;">
                            <h5 class="card-title" style="text-decoration: line-through;">${lockIcon}${job.nombre_trabajo}</h5>
                            <span class="badge text-bg-secondary"
                            style="border-radius: 44px; text-align: center; padding-bottom: 0; display: inline-flex; align-items: center; background-color:${colorBadge}!important "> 
                                <p style="margin: 0;">${job.modalidad}</p>
                            </span>
                        </div>
                        <p class="card-text">${job.nivel} - $${job.salario_minimo}–${job.salario_maximo}</p>
                        <p class="card-text"><i class="bi bi-geo-alt"></i>${job.ubicacion}.</p>
                    </div>
                </button>`;
                if ((i + 1) % 3 === 0 && i !== closedJobs.length - 1) {
                    closedJobsRow!.innerHTML += `<div class="w-100"></div>`;
                }
            });
        }

        // Si no hay trabajos
        if (openJobs.length === 0 && closedJobs.length === 0) {
            jobList.innerHTML = `<p class="text-center mt-4">No hay vacantes para mostrar.</p>`;
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
        document.getElementById('btnVerCandidatos')!.addEventListener('click', () => this.verCandidatos(trabajo?.id_trabajo + ""));

        // document.getElementById("btnCerrarVacante")!.setAttribute('data-job-id', trabajo!.id_trabajo.toString());

        console.log("Estado del trabajo (true=abierto, false=cerrado):", trabajo!.estado);

        if (trabajo!.estado) {


            //si el trabajo está abierto, el botón debe permitir cerrarlo
            document.getElementById("btnCambiarEstadoVacante")!.textContent = "Cerrar Vacante";
            document.getElementById("btnCambiarEstadoVacante")!.className = "btn btn-danger ";

            //cambiamos el texto y clase del botón y del modal según el estado del trabajo
            document.getElementById("modalBodyConfirmacionCerrarVacante")!.textContent = "¿Estás seguro que deseas cerrar esta vacante?";
            document.getElementById("btnConfirmarCambiarEstadoVacante")!.textContent = "Sí, cerrar vacante";
            document.getElementById("btnConfirmarCambiarEstadoVacante")!.className = "btn btn-danger";


            //asignamos el evento al botón confirmar cerrar vacante
            document.getElementById("btnConfirmarCambiarEstadoVacante")?.addEventListener('click', () => this.cambiarEstadoVacante(trabajo!.id_trabajo, trabajo!.estado));
        }
        else {

            //si el trabajo está cerrado, el botón debe permitir reabrirlo
            document.getElementById("btnCambiarEstadoVacante")!.textContent = "Reabrir Vacante";
            document.getElementById("btnCambiarEstadoVacante")!.className = "btn btn-success ";
            //cambiamos el texto y clase del botón y del modal según el estado del trabajo
            document.getElementById("modalBodyConfirmacionCerrarVacante")!.textContent = "¿Estás seguro que deseas reabrir esta vacante?";
            document.getElementById("btnConfirmarCambiarEstadoVacante")!.textContent = "Sí, reabrir vacante";
            document.getElementById("btnConfirmarCambiarEstadoVacante")!.className = "btn btn-success";

            //asignamos el evento al botón confirmar reabrir vacante
            document.getElementById("btnConfirmarCambiarEstadoVacante")?.addEventListener('click', () => this.cambiarEstadoVacante(trabajo!.id_trabajo, trabajo!.estado));
        }

    }

    public async cambiarEstadoVacante(idTrabajo: number, estado: boolean) {
        console.log("Cerrando o abriendo vacante con ID:", idTrabajo);


        let response;
        //si esta abierta la cerramos, sino la reabrimos
        if (estado) {
            response = await JobsService.closeJob(idTrabajo);
        }
        else {
            response = await JobsService.openJob(idTrabajo);
        }

        if (!response.success) {
            alert(response.message);
            return;
        }
        this.loadJobs();

    }

    public filtrorPorBusqueda(): void {
        const tituloBuscar = (document.getElementById("tituloBuscar") as HTMLInputElement).value.toLowerCase();
        const ubicacionBuscar = (document.getElementById("ubicacionBuscar") as HTMLInputElement).value.toLowerCase();
        const salarioBuscar = (document.getElementById("salarioBuscar") as HTMLInputElement).value;
        console.log("Buscando por:", { tituloBuscar, ubicacionBuscar, salarioBuscar });

        this.filteredJobs = this.jobs.filter(job => {
            const matchesTitulo = job.nombre_trabajo.toLowerCase().includes(tituloBuscar);
            const matchesUbicacion = job.ubicacion.toLowerCase().includes(ubicacionBuscar);
            const matchesSalario = salarioBuscar ? (job.salario_minimo <= parseInt(salarioBuscar) && job.salario_maximo >= parseInt(salarioBuscar)) : true;
            return matchesTitulo && matchesUbicacion && matchesSalario;
        });
        this.renderJobs();
    }


    // Redirige a la página de ver candidatos con el puesto seleccionado en la url
    public verCandidatos(puesto: number | string) {
        // Redirigir a la página de ver candidatos con el puesto seleccionado


        //!! util para ver vacantes por nombre para barra de búsqueda
        if (isNaN(parseInt(puesto as string))) {
            console.log("el puesto fue enviado como:", puesto);
            puesto = this.jobs.find(job => (job.nombre_trabajo).toLowerCase().includes(puesto as string))?.id_trabajo || "-1";
            if (puesto === "-1") {
                alert("No se encontró la vacante especificada.");
                return;
            }
            console.log("el puesto fue convertido a id:", puesto);
        }
        window.location.href = `/src/pages/enterprise/view-candidates.html?puesto=${encodeURIComponent(
            puesto
        )}`;
    }
}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseHomeController: EnterpriseHomeController;
    }
}

window.enterpriseHomeController = new EnterpriseHomeController();
