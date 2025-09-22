import { sessionManager } from '../../lib/session.js';

type Job = {
    id: number;
    title: string;
    location: string;
    salary: string;
    days: string;
    badges: string[];
    icon: string;
    modalidad: string;
    fechaPublicacion: string;
    descripcion: string;
};

export class EnterpriseHomeController {
    private jobs: Job[] = [
        { id: 1, title: "Marketing Manager", location: "New Mexico, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Remote"], icon: "https://img.icons8.com/color/48/000000/briefcase.png", modalidad: "Remota", fechaPublicacion: "2024-06-01", descripcion: "Gestiona campañas de marketing y lidera el equipo creativo." },
        { id: 2, title: "Project Manager", location: "Dhaka, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/ios-filled/50/apple-logo.png", modalidad: "Presencial", fechaPublicacion: "2024-06-02", descripcion: "Coordina proyectos y asegura la entrega a tiempo y dentro del presupuesto." },
        { id: 3, title: "Interaction Designer", location: "New York, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Full Time"], icon: "https://img.icons8.com/color/48/000000/design--v1.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-03", descripcion: "Diseña experiencias de usuario atractivas y funcionales." },
        { id: 4, title: "Networking Engineer", location: "Washington, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/networking-manager.png", modalidad: "Presencial", fechaPublicacion: "2024-06-04", descripcion: "Mantiene y optimiza la infraestructura de redes de la empresa." },
        { id: 5, title: "Product Designer", location: "Ohio, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/box.png", modalidad: "Remota", fechaPublicacion: "2024-06-05", descripcion: "Desarrolla y mejora productos digitales centrados en el usuario." },
        { id: 6, title: "Junior Graphic Designer", location: "Natore, Bangladesh", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-illustrator.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-06", descripcion: "Crea materiales gráficos y apoya al equipo de diseño." },
        { id: 7, title: "Software Engineer", location: "Montana, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Part Time"], icon: "https://img.icons8.com/color/48/000000/source-code.png", modalidad: "Remota", fechaPublicacion: "2024-06-07", descripcion: "Desarrolla y mantiene aplicaciones web y móviles." },
        { id: 8, title: "Front End Developer", location: "Sivas, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Contract Base"], icon: "https://img.icons8.com/color/48/000000/code.png", modalidad: "Presencial", fechaPublicacion: "2024-06-08", descripcion: "Implementa interfaces de usuario modernas y responsivas." },
        { id: 9, title: "Technical Support Specialist", location: "Chattogram, Bangladesh", salary: "$10k–15k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/technical-support.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-09", descripcion: "Brinda soporte técnico y resuelve incidencias de clientes." },
        { id: 10, title: "Visual Designer", location: "Konya, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-photoshop.png", modalidad: "Remota", fechaPublicacion: "2024-06-10", descripcion: "Diseña elementos visuales para productos digitales y campañas." },
        { id: 11, title: "Marketing Officer", location: "Paris, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Temporary"], icon: "https://img.icons8.com/color/48/000000/marketing.png", modalidad: "Presencial", fechaPublicacion: "2024-06-11", descripcion: "Ejecuta estrategias de marketing y analiza resultados." },
        { id: 12, title: "Senior UX Designer", location: "Mymensingh, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/ux.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-12", descripcion: "Lidera el diseño de experiencias de usuario innovadoras." }
    ];

    private filteredJobs: Job[] = [...this.jobs];

    constructor() {
        this.init();
    }

    private init(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.renderJobs();
        });
    }

    /**
     * Carga y muestra los datos del usuario desde localStorage
     */
    public loadUserData(): void {
        try {
            const storedUser = sessionManager.getStoredUser();
            const userNameDisplay = document.getElementById('userNameDisplay');

            if (storedUser && userNameDisplay) {
                // Mostrar username si existe, sino mostrar email o id como fallback
                if (storedUser.usuario) {
                    userNameDisplay.textContent = storedUser.usuario;
                } else if (storedUser.nombre) {
                    userNameDisplay.textContent = storedUser.nombre;
                } else if (storedUser.email) {
                    userNameDisplay.textContent = storedUser.email;
                } else {
                    userNameDisplay.textContent = 'Usuario';
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = 'Usuario';
            }
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
            } else if (job.modalidad === "Híbrida") {
                colorBadge = "red";
            } else {
                colorBadge = "green";
            }

            const lastRow = jobList.querySelector(".row:last-child");
            if (lastRow) {
                lastRow.innerHTML += `<button onclick="enterpriseHomeController.llenarModalDetalleTrabajo(${job.id})" data-bs-toggle="modal" data-bs-target="#modalDetalleTrabajo" class="card col-md-4 col-6 mx-2"
                    style="width: 25rem; padding: 1%; background-color: #ECECEC; box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: none; ">
                    <div class="card-body">
                        <div class="d-flex" style="text-align: center; justify-content: space-between; width: 100%;">

                            <h5 class="card-title">${job.title}</h5>
                            <span class="badge text-bg-secondary "
                            style="border-radius: 44px; text-align: center; padding-bottom: 0; display: inline-flex; align-items: center; background-color:${colorBadge}!important "> 
                                <p style="margin: 0;">${job.modalidad}</p>
                                </span>
                                </div>
                        <p class="card-text">${job.badges.concat(",")} - ${job.salary}</p>
                        <p class="card-text"><i class="bi bi-geo-alt"></i>${job.location}.</p>
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

        // Filtramos
        if (ordenFecha === "recientes") {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
            });
        } else {
            this.filteredJobs = this.filteredJobs.slice().sort((a, b) => {
                return new Date(a.fechaPublicacion).getTime() - new Date(b.fechaPublicacion).getTime();
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
        const trabajo = this.jobs.find(t => t.id === idTrabajo);
        console.log(trabajo);

        // Llenar los elementos del modal con los datos del trabajo
        document.getElementById("modalTitulo")!.textContent = trabajo!.title
        document.getElementById("modalDescripcion")!.textContent = trabajo!.descripcion;
        document.getElementById("modalModalidad")!.textContent = trabajo!.modalidad;
        document.getElementById("modalUbicacion")!.textContent = trabajo!.location
    }
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseHomeController: EnterpriseHomeController;
    }
}

window.enterpriseHomeController = new EnterpriseHomeController();