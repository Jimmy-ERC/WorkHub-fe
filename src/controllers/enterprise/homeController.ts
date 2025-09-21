import { sessionManager } from '../../lib/session.js';

type Job = {
    title: string;
    location: string;
    salary: string;
    days: string;
    badges: string[];
    icon: string;
    modalidad: string;
    fechaPublicacion: string;
};

export class EnterpriseHomeController {
    private jobs: Job[] = [
        { title: "Marketing Manager", location: "New Mexico, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Remote"], icon: "https://img.icons8.com/color/48/000000/briefcase.png", modalidad: "Remota", fechaPublicacion: "2024-06-01" },
        { title: "Project Manager", location: "Dhaka, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/ios-filled/50/apple-logo.png", modalidad: "Presencial", fechaPublicacion: "2024-06-02" },
        { title: "Interaction Designer", location: "New York, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Full Time"], icon: "https://img.icons8.com/color/48/000000/design--v1.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-03" },
        { title: "Networking Engineer", location: "Washington, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/networking-manager.png", modalidad: "Presencial", fechaPublicacion: "2024-06-04" },
        { title: "Product Designer", location: "Ohio, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/box.png", modalidad: "Remota", fechaPublicacion: "2024-06-05" },
        { title: "Junior Graphic Designer", location: "Natore, Bangladesh", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-illustrator.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-06" },
        { title: "Software Engineer", location: "Montana, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Part Time"], icon: "https://img.icons8.com/color/48/000000/source-code.png", modalidad: "Remota", fechaPublicacion: "2024-06-07" },
        { title: "Front End Developer", location: "Sivas, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Contract Base"], icon: "https://img.icons8.com/color/48/000000/code.png", modalidad: "Presencial", fechaPublicacion: "2024-06-08" },
        { title: "Technical Support Specialist", location: "Chattogram, Bangladesh", salary: "$10k–15k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/technical-support.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-09" },
        { title: "Visual Designer", location: "Konya, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-photoshop.png", modalidad: "Remota", fechaPublicacion: "2024-06-10" },
        { title: "Marketing Officer", location: "Paris, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Temporary"], icon: "https://img.icons8.com/color/48/000000/marketing.png", modalidad: "Presencial", fechaPublicacion: "2024-06-11" },
        { title: "Senior UX Designer", location: "Mymensingh, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/ux.png", modalidad: "Híbrida", fechaPublicacion: "2024-06-12" }
    ];

    private filteredJobs: Job[] = [...this.jobs];
    private jobsPerPage = 9;
    private currentPage = 1;

    constructor() {
        this.init();
    }

    private init(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.renderJobs(this.currentPage);
            this.renderPagination();
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
    public renderJobs(page: number): void {
        const jobList = document.getElementById("jobList");
        if (!jobList) return;

        jobList.innerHTML = "";

        const start = (page - 1) * this.jobsPerPage;
        const end = start + this.jobsPerPage;
        const paginatedJobs = this.filteredJobs.slice(start, end);

        // Creamos row inicial
        jobList.innerHTML += `<div class="row" style="justify-content: center; justify-self: center;"></div>`;

        for (let i = 0; i < paginatedJobs.length; i++) {
            const job = paginatedJobs[i];
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
                lastRow.innerHTML += `
                <div class="card col-md-4 col-6 m-2"
                    style="width: 18rem; height: 15rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="card-body">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <img src="${job.icon}" alt="icon" width="40">
                            <span class="badge" style="background-color: ${colorBadge};">${job.modalidad}</span>
                        </div>
                        <h5 class="card-title">${job.title}</h5>
                        <p class="card-text">${job.location}</p>
                        <p class="card-text">${job.salary}</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">${job.days}</small>
                    </div>
                </div>`;
            }

            if ((i + 1) % 3 === 0) {
                jobList.innerHTML += `<div class="row" style="justify-content: center; justify-self: center;"></div>`;
            }
        }
    }

    /**
     * Renderiza la paginación
     */
    public renderPagination(): void {
        const pagination = document.getElementById("pagination");
        if (!pagination) return;

        pagination.innerHTML = "";
        const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
            <button class="${i === this.currentPage ? "active" : ""}" onclick="enterpriseHomeController.goToPage(${i})">${i}</button>`;
        }
    }

    /**
     * Navega a una página específica
     */
    public goToPage(page: number): void {
        this.currentPage = page;
        this.renderJobs(page);
        this.renderPagination();
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

        this.renderJobs(this.currentPage);
        this.renderPagination();
    }

    /**
     * Actualiza la cantidad de items por página
     */
    public actualizarItemsPorPagina(): void {
        const itemsPorPaginaElement = document.getElementById("itemsPorPagina") as HTMLSelectElement;
        if (!itemsPorPaginaElement) return;

        this.jobsPerPage = parseInt(itemsPorPaginaElement.value);
        this.renderJobs(this.currentPage);
        this.renderPagination();
    }
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseHomeController: EnterpriseHomeController;
    }
}

window.enterpriseHomeController = new EnterpriseHomeController();