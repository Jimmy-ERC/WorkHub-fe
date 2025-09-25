export class EnterpriseViewCandidatesController {
    private candidates = [
        {
            idTrabajo: 3,
            nombre: "Ana Martínez",
            fotoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Mexico City, Mexico",
            experiencia: "3 years in web development with React and TypeScript"
        },
        {
            idTrabajo: 3,
            nombre: "Pedro Ramírez",
            fotoUrl: "https://randomuser.me/api/portraits/men/23.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Guadalajara, Mexico",
            experiencia: "2 years with Angular and JavaScript"
        },
        {
            idTrabajo: 7,
            nombre: "Carlos Gómez",
            fotoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
            puesto: "Software Engineer",
            ubicacion: "Bogotá, Colombia",
            experiencia: "5 years in data analysis and Big Data"
        },
        {
            idTrabajo: 7,
            nombre: "Sofía Herrera",
            fotoUrl: "https://randomuser.me/api/portraits/women/21.jpg",
            puesto: "Software Engineer",
            ubicacion: "Quito, Ecuador",
            experiencia: "3 years in ETL and Python"
        },
        {
            idTrabajo: 1,
            nombre: "Lucía Fernández",
            fotoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
            puesto: "Marketing Manager",
            ubicacion: "Madrid, Spain",
            experiencia: "4 years in interface design and user experience"
        },
        {
            idTrabajo: 1,
            nombre: "Javier Ruiz",
            fotoUrl: "https://randomuser.me/api/portraits/men/45.jpg",
            puesto: "Marketing Manager",
            ubicacion: "Barcelona, Spain",
            experiencia: "2 years in mobile app design"
        },
        {
            idTrabajo: 12,
            nombre: "Miguel Torres",
            fotoUrl: "https://randomuser.me/api/portraits/men/15.jpg",
            puesto: "Senior UX Designer",
            ubicacion: "Lima, Peru",
            experiencia: "6 years in development with Node.js and SQL databases"
        },
        {
            idTrabajo: 12,
            nombre: "Valentina López",
            fotoUrl: "https://randomuser.me/api/portraits/women/56.jpg",
            puesto: "Senior UX Designer",
            ubicacion: "Santiago, Chile",
            experiencia: "4 years in Java and Spring Boot"
        },
        {
            idTrabajo: 3,
            nombre: "Luis Castillo",
            fotoUrl: "https://randomuser.me/api/portraits/men/67.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Monterrey, Mexico",
            experiencia: "1 year with Vue.js"
        },
        {
            idTrabajo: 7,
            nombre: "Andrea Morales",
            fotoUrl: "https://randomuser.me/api/portraits/women/77.jpg",
            puesto: "Software Engineer",
            ubicacion: "Medellín, Colombia",
            experiencia: "2 years in cloud data solutions"
        }
    ]

    private filteredCandidates = [...this.candidates]
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("cargando datos de candidatos")
            this.renderCandidates();
        })
    }

    public renderCandidates(): void {
        let candidatesPerJob = this.filteredCandidates;

        //todo: mejorar para que evalue el id del trabajo
        const puesto = getPuestoFromUrl();
        if (puesto) {
            candidatesPerJob = this.filteredCandidates.filter(c => c.puesto.includes(puesto));
        }


        document.getElementById('nombreVacante')!.innerText = puesto || 'Puesto no especificado';
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
//obtiene el puesto de la URL
//TODO: mejorar para que tome el id del trabajo
function getPuestoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('puesto');
}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseViewCandidatesController: EnterpriseViewCandidatesController;
    }
}

window.enterpriseViewCandidatesController = new EnterpriseViewCandidatesController();