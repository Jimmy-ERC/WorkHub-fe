import type { Job } from '@/interfaces/job.interface.js';
import { loadUserData } from '../../lib/userDataLoader.js';
import { ProfileEnterpriseService } from '@/services/profileService';
import type { ProfileResponse } from '@/interfaces/profileResponse.interface.js';
import { JobsService } from '@/services/jobsService.js';



export class EnterpriseHomeController {
    // private jobs: Job[] = [
    //     {
    //         id_trabajo: 1,
    //         id_perfil: 10,
    //         id_categoria: 2,
    //         nombre_trabajo: "Marketing Manager",
    //         descripcion: "Gestiona campañas de marketing y lidera el equipo creativo.",
    //         responsabilidades: "Planificar campañas, liderar equipo creativo.",
    //         salario_minimo: 50000,
    //         salario_maximo: 80000,
    //         modalidad: "Remota",
    //         educacion: "Licenciatura en Marketing",
    //         experiencia: "3 años en marketing digital.",
    //         fecha_expiracion: "2024-06-30T06:00:00.000Z",
    //         nivel: "Senior",
    //         ubicacion: "New Mexico, USA"
    //     },
    //     {
    //         id_trabajo: 2,
    //         id_perfil: 11,
    //         id_categoria: 1,
    //         nombre_trabajo: "Project Manager",
    //         descripcion: "Coordina proyectos y asegura la entrega a tiempo y dentro del presupuesto.",
    //         responsabilidades: "Gestionar proyectos, coordinar equipos.",
    //         salario_minimo: 50000,
    //         salario_maximo: 90000,
    //         modalidad: "Presencial",
    //         educacion: "Ingeniería Industrial",
    //         experiencia: "5 años gestionando proyectos.",
    //         fecha_expiracion: "2024-07-01T06:00:00.000Z",
    //         nivel: "Senior",
    //         ubicacion: "Dhaka, Bangladesh"
    //     },
    //     {
    //         id_trabajo: 3,
    //         id_perfil: 12,
    //         id_categoria: 3,
    //         nombre_trabajo: "Interaction Designer",
    //         descripcion: "Diseña experiencias de usuario atractivas y funcionales.",
    //         responsabilidades: "Diseñar interfaces, colaborar con desarrolladores.",
    //         salario_minimo: 50000,
    //         salario_maximo: 80000,
    //         modalidad: "Híbrido",
    //         educacion: "Diseño Gráfico o afín",
    //         experiencia: "2 años en UX/UI.",
    //         fecha_expiracion: "2024-07-02T06:00:00.000Z",
    //         nivel: "Mid",
    //         ubicacion: "New York, USA"
    //     },
    //     { id_trabajo: 4, id_perfil: 13, id_categoria: 4, nombre_trabajo: "Networking Engineer", descripcion: "Mantiene y optimiza la infraestructura de redes de la empresa.", responsabilidades: "Configurar routers, switches y firewalls.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Presencial", educacion: "Ingeniería en Sistemas o afín", experiencia: "2 años en soporte de redes.", fecha_expiracion: "2024-07-03T06:00:00.000Z", nivel: "Mid", ubicacion: "Washington, USA" },
    //     { id_trabajo: 5, id_perfil: 14, id_categoria: 5, nombre_trabajo: "Product Designer", descripcion: "Desarrolla y mejora productos digitales centrados en el usuario.", responsabilidades: "Investigar usuarios, prototipar y diseñar productos.", salario_minimo: 50000, salario_maximo: 80000, modalidad: "Remota", educacion: "Diseño Industrial, Gráfico o afín", experiencia: "3 años en diseño de productos digitales.", fecha_expiracion: "2024-07-04T06:00:00.000Z", nivel: "Senior", ubicacion: "Ohio, USA" },
    //     { id_trabajo: 6, id_perfil: 15, id_categoria: 6, nombre_trabajo: "Junior Graphic Designer", descripcion: "Crea materiales gráficos y apoya al equipo de diseño.", responsabilidades: "Diseñar gráficos para web y print, apoyar en campañas.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Híbrida", educacion: "Diseño Gráfico", experiencia: "1 año en diseño gráfico.", fecha_expiracion: "2024-07-05T06:00:00.000Z", nivel: "Junior", ubicacion: "Natore, Bangladesh" },
    //     { id_trabajo: 7, id_perfil: 16, id_categoria: 7, nombre_trabajo: "Software Engineer", descripcion: "Desarrolla y mantiene aplicaciones web y móviles.", responsabilidades: "Programar, probar y depurar aplicaciones.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Remota", educacion: "Ingeniería en Sistemas, Computación o afín", experiencia: "2 años en desarrollo de software.", fecha_expiracion: "2024-07-06T06:00:00.000Z", nivel: "Mid", ubicacion: "Montana, USA" },
    //     { id_trabajo: 8, id_perfil: 17, id_categoria: 8, nombre_trabajo: "Front End Developer", descripcion: "Implementa interfaces de usuario modernas y responsivas.", responsabilidades: "Desarrollar el front-end de aplicaciones web.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Presencial", educacion: "Ingeniería en Sistemas, Computación o afín", experiencia: "2 años en desarrollo front-end.", fecha_expiracion: "2024-07-07T06:00:00.000Z", nivel: "Mid", ubicacion: "Sivas, Turkey" },
    //     { id_trabajo: 9, id_perfil: 18, id_categoria: 9, nombre_trabajo: "Technical Support Specialist", descripcion: "Brinda soporte técnico y resuelve incidencias de clientes.", responsabilidades: "Atender consultas técnicas, resolver problemas de software y hardware.", salario_minimo: 10000, salario_maximo: 15000, modalidad: "Híbrida", educacion: "Técnico en Soporte o afín", experiencia: "1 año en soporte técnico.", fecha_expiracion: "2024-07-08T06:00:00.000Z", nivel: "Junior", ubicacion: "Chattogram, Bangladesh" },
    //     { id_trabajo: 10, id_perfil: 19, id_categoria: 10, nombre_trabajo: "Visual Designer", descripcion: "Diseña elementos visuales para productos digitales y campañas.", responsabilidades: "Crear y editar gráficos, colaborar con el equipo de marketing.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Remota", educacion: "Diseño Gráfico, Comunicación Visual o afín", experiencia: "2 años en diseño visual.", fecha_expiracion: "2024-07-09T06:00:00.000Z", nivel: "Mid", ubicacion: "Konya, Turkey" },
    //     { id_trabajo: 11, id_perfil: 20, id_categoria: 11, nombre_trabajo: "Marketing Officer", descripcion: "Ejecuta estrategias de marketing y analiza resultados.", responsabilidades: "Implementar campañas de marketing, análisis de datos.", salario_minimo: 30000, salario_maximo: 35000, modalidad: "Presencial", educacion: "Marketing, Comunicación o afín", experiencia: "2 años en marketing.", fecha_expiracion: "2024-07-10T06:00:00.000Z", nivel: "Mid", ubicacion: "Paris, USA" },
    //     { id_trabajo: 12, id_perfil: 21, id_categoria: 12, nombre_trabajo: "Senior UX Designer", descripcion: "Lidera el diseño de experiencias de usuario innovadoras.", responsabilidades: "Investigar, diseñar y probar experiencias de usuario.", salario_minimo: 50000, salario_maximo: 90000, modalidad: "Híbrida", educacion: "Diseño Gráfico, Interacción o afín", experiencia: "5 años en diseño UX.", fecha_expiracion: "2024-07-11T06:00:00.000Z", nivel: "Senior", ubicacion: "Mymensingh, Bangladesh" }
    // ];

    private jobs: Job[] = [];

    private filteredJobs: Job[] = [...this.jobs];

    constructor() {
        this.init(); //espera a que el documento esté cargado y carga tanto los datos de usuario como los trabajos
    }

    private init(): void {

        //soluciona error desconocida de carga
        const runAll = async () => {
            await loadUserData();
            await this.loadJobs();
            this.renderJobs();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAll);
        } else {
            runAll();
        }
    }



    //carga los trabajos desde el servicio
    private async loadJobs(): Promise<void> {

        let profileResponse = await ProfileEnterpriseService.fetchEnterpriseProfile() as ProfileResponse;

        if (!profileResponse.success) {
            alert(profileResponse.message);
            return;
        }

        const profileId = profileResponse.data.id_perfil;
        console.log('ID de perfil obtenido:', profileId);

        try {
            let jobsResponse = (await JobsService.getJobsByProfileId(profileId));
            if (!jobsResponse.success) {
                alert(jobsResponse.message);
                return;
            }
            this.jobs = jobsResponse.data;
            this.filteredJobs = [...this.jobs];


            this.renderJobs();
        } catch (error) {
            console.error('Error al obtener los trabajos:', error);
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

            const lastRow = jobList.querySelector(".row:last-child");
            if (lastRow) {
                lastRow.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id_trabajo})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                    style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; ">
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
                </button>`
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
        const ordenFechaElement = document.getElementById("ordenFecha") as HTMLSelectElement;
        if (!ordenFechaElement) return;

        const ordenFecha = ordenFechaElement.value;

        // Filtramos por fecha de expiración
        if (ordenFecha === "recientes") {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return new Date(b.fecha_expiracion).getTime() - new Date(a.fecha_expiracion).getTime();
            });
        } else {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return new Date(a.fecha_expiracion).getTime() - new Date(b.fecha_expiracion).getTime();
            });
        }

        this.renderJobs();
    }

    /**
     * Actualiza la cantidad de items por página
     */
    public actualizarItemsPorPagina(): void {
        const itemsPorPaginaElement = document.getElementById("itemsPorPagina") as HTMLSelectElement;
        if (!itemsPorPaginaElement) return;

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
    }
}

function verCandidatos(puesto: any) {
    // Redirigir a la página de ver candidatos con el puesto seleccionado
    window.location.href = `/src/pages/enterprise/view-candidates.html?puesto=${encodeURIComponent(puesto)}`;
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseHomeController: EnterpriseHomeController;
    }
}

window.enterpriseHomeController = new EnterpriseHomeController();