import type { Job } from "@/interfaces/job.interface.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { ProfileEnterpriseService } from '@/services/profileEnterprise.service.js';
import type { ProfileResponse } from "@/interfaces/profileResponse.interface.js";
import { JobsService } from "@/services/jobsService.js";


export class ViewJobController {

    private jobs: Job[] = [];
    
        private filteredJobs: Job[] = [...this.jobs];
    
        constructor() {
            this.init(); //Espera a que el documento esté cargado y carga tanto los datos de usuario como los trabajos
        }
    
        private init(): void {
            console.log("jobId en localStorage:", localStorage.getItem('jobId'));
            //Soluciona error desconocida de carga
            const runAll = async () => {
                await loadUserData();
                const jobId = Number(localStorage.getItem('jobId'));
                console.log("id", jobId)
                if (jobId) {
                    await this.loadJobs(jobId);
                }else{
                    console.error("no se encontro id")
                }
            };
    
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", runAll);
            } else {
                runAll();
            }
        }
    
        //Carga los trabajos desde el servicio
        private async loadJobs(jobId: number): Promise<void> {
            try {
                let jobsResponse = await JobsService.getJobsById(jobId);
                if (!jobsResponse.success) {
                    alert(jobsResponse.message);
                    return;
                }
                this.jobs = jobsResponse.data;
                console.log("this.jobs",this.jobs);
                this.filteredJobs = [...this.jobs];
    
                this.renderJobs();
            } catch (error) {
                console.error("Error al obtener los trabajos:", error);
            }
        }

        public renderJobs(): void {
        const jobList = document.getElementById("jobDetails");
        const jobSideBar = document.getElementById("jobSideBar");
        if (!jobList) return;

        jobList.innerHTML = "";

        // Creamos row inicial
        //jobList.innerHTML += `<div class="row py-2" style="justify-content: center; justify-self: center;"></div>`;

        if (jobList && jobSideBar) {
                jobList.innerHTML += `
                    <div class="job-header mb-3">
                        <img src="#" alt="Logo empresa">
                        <div>
                            <h4 class="mb-0">${this.jobs[0]?.nombre_trabajo}</h4>
                            <small class="text-muted">Instagram • Full Time • Featured</small>
                        </div>
                    </div>
                
                    <h5>Descripción del trabajo</h5>
                    <p>
                        ${this.jobs[0]?.descripcion}
                    </p>
                
                    <h5>Responsabilidades</h5>
                    <ul>
                        <li>${this.jobs[0]?.responsabilidades}</li>
                    </ul>

                    <button class="btn apply-btn w-100 mt-3" data-bs-toggle="modal" data-bs-target="#applyModal">
                        Aplica Ahora
                    </button>`;

                    jobSideBar.innerHTML += `
                    <div class="section-card">
                    <h5>Vista del trabajo</h5>
                    <ul class="list-unstyled job-meta">
                        <li><i class="bi bi-calendar"></i><strong>Publicado:</strong> 14 Junio 2021</li>
                        <li><i class="bi bi-clock"></i><strong>Expira:</strong> ${this.jobs[0]?.fecha_expiracion}</li>
                        <li><i class="bi bi-mortarboard"></i><strong>Educación:</strong> ${this.jobs[0]?.educacion}</li>
                        <li><i class="bi bi-cash-stack"></i><strong>Salario:</strong> $${this.jobs[0]?.salario_minimo} - $${this.jobs[0]?.salario_maximo}/mes</li>
                        <li><i class="bi bi-award"></i><strong>Nivel:</strong> ${this.jobs[0]?.nivel}</li>
                        <li><i class="bi bi-geo-alt"></i><strong>Ubicación:</strong> ${this.jobs[0]?.ubicacion}</li>
                        <li><i class="bi bi-briefcase"></i><strong>Tipo:</strong> ${this.jobs[0]?.modalidad}</li>
                        <li><i class="bi bi-award"></i><strong>Experiencia:</strong> ${this.jobs[0]?.experiencia}</li>
                    </ul>
                </div>
            
                <div class="section-card">
                    <h5>Sobre la Empresa</h5>
                    <p><strong>Instagram</strong><br>
                        Red social • Fundada en 2006
                    </p>
                    <p><strong>Empleados:</strong> 120-300</p>
                    <p><strong>Email:</strong> career@instagram.com</p>
                </div>`;
            }

        // for (let i = 0; i < this.filteredJobs.length; i++) {
        //     const job = this.filteredJobs[i];
        //     if (!job) continue;

        //     let colorBadge = "grey";
        //     if (job.modalidad === "Remota") {
        //         colorBadge = "blue";
        //     } else if (job.modalidad === "Híbrido" || job.modalidad === "Híbrida") {
        //         colorBadge = "red";
        //     } else {
        //         colorBadge = "green";
        //     }

        //     //const lastRow = jobList.querySelector(".row:last-child");
            

        //     if ((i + 1) % 3 === 0) {
        //         jobList.innerHTML += `<div class="row p-2" style="justify-content: center; justify-self: center;"></div>`;
        //     }
        // }
    }
}

// ...existing code...

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        viewJobController: ViewJobController;
    }
}

window.viewJobController = new ViewJobController();