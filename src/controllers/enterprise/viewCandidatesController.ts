export class EnterpriseViewCandidatesController {
    private candidates = [
        {
            idTrabajo: 3,
            nombre: "Ana Martínez",
            fotoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
            puesto: "Frontend Developer",
            ubicacion: "Mexico City, Mexico",
            experiencia: "3 years in web development with React and TypeScript"
        },
        {
            idTrabajo: 7,
            nombre: "Carlos Gómez",
            fotoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
            puesto: "Data Engineer",
            ubicacion: "Bogotá, Colombia",
            experiencia: "5 years in data analysis and Big Data"
        },
        {
            idTrabajo: 1,
            nombre: "Lucía Fernández",
            fotoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
            puesto: "UX/UI Designer",
            ubicacion: "Madrid, Spain",
            experiencia: "4 years in interface design and user experience"
        },
        {
            idTrabajo: 12,
            nombre: "Miguel Torres",
            fotoUrl: "https://randomuser.me/api/portraits/men/15.jpg",
            puesto: "Backend Developer",
            ubicacion: "Lima, Peru",
            experiencia: "6 years in development with Node.js and SQL databases"
        }
    ]

    private filteredCandidates = [...this.candidates]
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("cargando datos de candidatos")
            this.renderCandidates();
        })
    }

    public renderCandidates(jobId?: number): void {
        let candidatesPerJob = this.filteredCandidates;
        if (jobId) {

            //candidatos del trabajo especifico
            candidatesPerJob = this.filteredCandidates.filter(c => c.idTrabajo === jobId);
        }


        const listCandidatos = document.getElementById('listCandidatos');
        if (!listCandidatos) return;
        listCandidatos.innerHTML = ``;
        for (const candidate of candidatesPerJob) {
            listCandidatos.innerHTML += `  <div class="card flex row mb-2"
                            style="width: 100%; display:flex !important; flex-direction:row; overflow: auto; justify-content: center; flex-wrap: wrap;">
                            <!-- contenido  -->
                            <div class="col-12 col-md-9 d-flex align-items-center" style="padding: 1%;">
                                <img src="${candidate.fotoUrl}" class="card-img-top"
                                    style="max-width: 90px; border-radius: 20px; height: auto;" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">${candidate.nombre}</h5>
                                    <p class="card-text">${candidate.puesto}</p>
                                    <div class="d-flex flex-wrap">
                                        <p class="me-3"><i class="bi bi-geo-alt"></i> Ubicación</p>
                                        <p><i class="bi bi-briefcase"></i> Experiencia</p>
                                    </div>
                                </div>
                            </div>
                            <!-- acciones -->
                            <div
                                class="col-12 col-md-3 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0">
                                <button type="button" class="btn btn-primary w-100 w-md-auto">Ver Perfil →</button>
                            </div>
                        </div>

            `
        }

    }
}

// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseViewCandidatesController: EnterpriseViewCandidatesController;
    }
}

window.enterpriseViewCandidatesController = new EnterpriseViewCandidatesController();