import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { JobsService } from "@/services/jobsService.js";



// import { sessionManager } from '../../lib/session.js';


export class CandidateHomeController {
    // private jobs = [
    //     { title: "Marketing Manager", location: "New Mexico, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Remote"], icon: "https://img.icons8.com/color/48/000000/briefcase.png" },
    //     { title: "Project Manager", location: "Dhaka, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/ios-filled/50/apple-logo.png" },
    //     { title: "Interaction Designer", location: "New York, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Full Time"], icon: "https://img.icons8.com/color/48/000000/design--v1.png" },
    //     { title: "Networking Engineer", location: "Washington, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/networking-manager.png" },
    //     { title: "Product Designer", location: "Ohio, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/box.png" },
    //     { title: "Junior Graphic Designer", location: "Natore, Bangladesh", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-illustrator.png" },
    //     { title: "Software Engineer", location: "Montana, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Part Time"], icon: "https://img.icons8.com/color/48/000000/source-code.png" },
    //     { title: "Front End Developer", location: "Sivas, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Contract Base"], icon: "https://img.icons8.com/color/48/000000/code.png" },
    //     { title: "Technical Support Specialist", location: "Chattogram, Bangladesh", salary: "$10k–15k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/technical-support.png" },
    //     { title: "Visual Designer", location: "Konya, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-photoshop.png" },
    //     { title: "Marketing Officer", location: "Paris, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Temporary"], icon: "https://img.icons8.com/color/48/000000/marketing.png" },
    //     { title: "Senior UX Designer", location: "Mymensingh, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/ux.png" }
    // ];

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
            console.log("Jobs", this.filteredJobs);
        const jobList = document.getElementById("jobList");
        if (!jobList) return;

        jobList.innerHTML = "";

        // Creamos row inicial
        jobList.innerHTML += `<div class="row py-2" style="justify-content: center; justify-self: center;"></div>`;

        for (let i = 0; i < this.filteredJobs.length; i++) {
            const job = this.filteredJobs[i];
            console.log("trabajo", job);
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
                    <a href="/src/pages/candidate/view-job.html" class="btn apply-btn btn-sm" onclick="localStorage.setItem('jobId', '${job.id_trabajo}')">Apply Now →</a>
                </div>
            </div>`;
            }

            if ((i + 1) % 3 === 0) {
                jobList.innerHTML += `<div class="row p-2" style="justify-content: center; justify-self: center;"></div>`;
            }
        }
    }
}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        candidateHomeController: CandidateHomeController;
    }
}

window.candidateHomeController = new CandidateHomeController();