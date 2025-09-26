import { sessionManager } from '../../lib/session.js';

export class CandidateHomeController {
    private jobs = [
        { title: "Marketing Manager", location: "New Mexico, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Remote"], icon: "https://img.icons8.com/color/48/000000/briefcase.png" },
        { title: "Project Manager", location: "Dhaka, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/ios-filled/50/apple-logo.png" },
        { title: "Interaction Designer", location: "New York, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Featured", "Full Time"], icon: "https://img.icons8.com/color/48/000000/design--v1.png" },
        { title: "Networking Engineer", location: "Washington, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/networking-manager.png" },
        { title: "Product Designer", location: "Ohio, USA", salary: "$50k–80k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/box.png" },
        { title: "Junior Graphic Designer", location: "Natore, Bangladesh", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-illustrator.png" },
        { title: "Software Engineer", location: "Montana, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Part Time"], icon: "https://img.icons8.com/color/48/000000/source-code.png" },
        { title: "Front End Developer", location: "Sivas, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Contract Base"], icon: "https://img.icons8.com/color/48/000000/code.png" },
        { title: "Technical Support Specialist", location: "Chattogram, Bangladesh", salary: "$10k–15k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/technical-support.png" },
        { title: "Visual Designer", location: "Konya, Turkey", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/adobe-photoshop.png" },
        { title: "Marketing Officer", location: "Paris, USA", salary: "$30k–35k", days: "4 Days Remaining", badges: ["Temporary"], icon: "https://img.icons8.com/color/48/000000/marketing.png" },
        { title: "Senior UX Designer", location: "Mymensingh, Bangladesh", salary: "$50k–90k/month", days: "4 Days Remaining", badges: ["Full Time"], icon: "https://img.icons8.com/color/48/000000/ux.png" }
    ];

    private readonly jobsPerPage = 5;
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
        const paginatedJobs = this.jobs.slice(start, end);

        paginatedJobs.forEach(job => {
            const badgesHtml = job.badges.map(b => `<span class="badge bg-primary ms-2">${b}</span>`).join("");
            jobList.innerHTML += `
            <div class="list-group-item job-card d-flex justify-content-between align-items-center p-3 mb-2">
                <div class="d-flex align-items-center">
                    <img src="${job.icon}" class="me-3" alt="icon" width="40">
                    <div>
                        <h6 class="mb-1 fw-bold">${job.title} ${badgesHtml}</h6>
                        <small class="text-muted">${job.location} • ${job.salary} • ${job.days}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-bookmark save-icon"></i>
                    <a href="#" class="btn apply-btn btn-sm">Apply Now →</a>
                </div>
            </div>`;
        });
    }

    /**
     * Renderiza la paginación
     */
    public renderPagination(): void {
        const pagination = document.getElementById("pagination");
        if (!pagination) return;

        pagination.innerHTML = "";
        const totalPages = Math.ceil(this.jobs.length / this.jobsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
            <button class="${i === this.currentPage ? "active" : ""}" onclick="candidateHomeController.goToPage(${i})">${i}</button>`;
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
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        candidateHomeController: CandidateHomeController;
    }
}

window.candidateHomeController = new CandidateHomeController();