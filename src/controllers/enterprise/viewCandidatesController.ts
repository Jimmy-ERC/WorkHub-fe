export class EnterpriseViewCandidatesController {
    private candidates = [
        {
            id: 1,
            idTrabajo: 3,
            nombre: "Ana Martínez",
            fotoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Mexico City, Mexico",
            experiencia: "2 - 4 Años",
            educacion: "Diplomado",
            genero: "Femenino",
            estado: "pendiente"
        },
        {
            id: 2,
            idTrabajo: 3,
            nombre: "Pedro Ramírez",
            fotoUrl: "https://randomuser.me/api/portraits/men/23.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Guadalajara, Mexico",
            experiencia: "1 - 2 Años",
            educacion: "Técnico",
            genero: "Masculino",
            estado: "pendiente"
        },
        {
            id: 3,
            idTrabajo: 7,
            nombre: "Carlos Gómez",
            fotoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
            puesto: "Software Engineer",
            ubicacion: "Bogotá, Colombia",
            experiencia: "4 - 6 Años",
            educacion: "Ingeniería",
            genero: "Masculino",
            estado: "pendiente"
        },
        {
            id: 4,
            idTrabajo: 7,
            nombre: "Sofía Herrera",
            fotoUrl: "https://randomuser.me/api/portraits/women/21.jpg",
            puesto: "Software Engineer",
            ubicacion: "Quito, Ecuador",
            experiencia: "2 - 4 Años",
            educacion: "Licenciatura",
            genero: "Femenino",
            estado: "pendiente"
        },
        {
            id: 5,
            idTrabajo: 1,
            nombre: "Lucía Fernández",
            fotoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
            puesto: "Marketing Manager",
            ubicacion: "Madrid, Spain",
            experiencia: "4 - 6 Años",
            educacion: "Diplomado",
            genero: "Femenino",
            estado: "pendiente"
        },
        {
            id: 6,
            idTrabajo: 1,
            nombre: "Javier Ruiz",
            fotoUrl: "https://randomuser.me/api/portraits/men/45.jpg",
            puesto: "Marketing Manager",
            ubicacion: "Barcelona, Spain",
            experiencia: "1 - 2 Años",
            educacion: "Secundaria",
            genero: "Masculino",
            estado: "pendiente"
        },
        {
            id: 7,
            idTrabajo: 12,
            nombre: "Miguel Torres",
            fotoUrl: "https://randomuser.me/api/portraits/men/15.jpg",
            puesto: "Senior UX Designer",
            ubicacion: "Lima, Peru",
            experiencia: "6 - 8 Años",
            educacion: "Ingeniería",
            genero: "Masculino",
            estado: "pendiente"
        },
        {
            id: 8,
            idTrabajo: 12,
            nombre: "Valentina López",
            fotoUrl: "https://randomuser.me/api/portraits/women/56.jpg",
            puesto: "Senior UX Designer",
            ubicacion: "Santiago, Chile",
            experiencia: "4 - 6 Años",
            educacion: "Licenciatura",
            genero: "Femenino",
            estado: "pendiente"
        },
        {
            id: 9,
            idTrabajo: 3,
            nombre: "Luis Castillo",
            fotoUrl: "https://randomuser.me/api/portraits/men/67.jpg",
            puesto: "Interaction Designer",
            ubicacion: "Monterrey, Mexico",
            experiencia: "1 - 2 Años",
            educacion: "Técnico",
            genero: "Masculino",
            estado: "pendiente"
        },
        {
            id: 10,
            idTrabajo: 7,
            nombre: "Andrea Morales",
            fotoUrl: "https://randomuser.me/api/portraits/women/77.jpg",
            puesto: "Software Engineer",
            ubicacion: "Medellín, Colombia",
            experiencia: "1 - 2 Años",
            educacion: "Diplomado",
            genero: "Femenino",
            estado: "pendiente"
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


        //filatramos por experiencia
        //==============================

        let experiencia = (document.querySelector('input[name="experiencia"]:checked') as HTMLInputElement)?.value + "";
        experiencia = experiencia.toLowerCase();
        if (experiencia) {
            console.log("filtrando por experiencia: " + experiencia);
            if (experiencia !== 'todos') {
                candidatesPerJob = candidatesPerJob.filter(c => {
                    return c.experiencia.toLowerCase().includes(experiencia)
                })
            }
        }


        //filtramos por educacion
        //=================================
        let filtrosEducacion = Array.from(document.querySelectorAll("input[name='educacion']:checked"));
        let valoresEducacion: string[] = [];
        if (filtrosEducacion.length > 0) {


            valoresEducacion = filtrosEducacion.map((el) => (el as HTMLInputElement).value.toLowerCase());

            if (!valoresEducacion.includes('todos')) {

                console.log("valores de educación seleccionados: ", valoresEducacion);

                candidatesPerJob = candidatesPerJob.filter(c => valoresEducacion.includes(c.educacion.toLowerCase()))
                console.log("candidatos despues de filtrar por educacion: ", candidatesPerJob);
            }
        }


        //filtramos por genero
        //=============================
        let genero = document.querySelector('input[name="genero"]:checked');
        if (genero) {
            let valorGenero = ((genero as HTMLInputElement).value).toLowerCase().trim();
            console.log("filtrando por genero:" + valorGenero, "filtro esperado:otros",);
            if (valorGenero !== 'todos') {
                console.log("entra a filtrar por genero");
                candidatesPerJob = candidatesPerJob.filter(c => c.genero.toLowerCase() === valorGenero)
            }
        }


        document.getElementById('nombreVacante')!.innerText = puesto || 'Puesto no especificado';
        const listCandidatos = document.getElementById('listCandidatos');
        if (!listCandidatos) return;
        listCandidatos.innerHTML = ``;
        for (const candidate of candidatesPerJob) {
            let colorBadge;
            switch (candidate.estado) {
                case 'aceptado':
                    colorBadge = 'success';
                    break;
                case 'rechazado':
                    colorBadge = 'danger';
                    break;
                default:
                    colorBadge = 'secondary';
            }

            let htmlAcciones = ``
            if (candidate.estado === "pendiente") {
                htmlAcciones = `<div
                                class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="verDetalleCandidato()">Ver Perfil →</button>
                                <button type="button" class="btn btn-success w-100 w-md-auto"  onClick="enterpriseViewCandidatesController.aceptarCandidato(${candidate.id})">
                                    Aceptar <i class="bi bi-check"></i>
                                </button>
                                <button type="button" class="btn btn-danger w-100 w-md-auto"  onClick="enterpriseViewCandidatesController.rechazarCandidato(${candidate.id})">
                                   Rechazar <i class="bi bi-x"></i>
                                </button>
                            </div>`
            }
            else {
                htmlAcciones = `<div
                                class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="verDetalleCandidato()">Ver Perfil →</button>
                            </div>`
            }
            listCandidatos.innerHTML += `  <div class="card flex row mb-2"
                            style="width: 100%; display:flex !important; flex-direction:row; overflow: auto; justify-content: center; flex-wrap: wrap; padding-left:3%;">
                            <!-- contenido  -->
                            <div class="col-12 col-sm-12 col-md-12 col-lg-10 d-flex align-items-center" style="padding: 1%;">
                                <img src="${candidate.fotoUrl}" class="card-img-top"
                                    style="max-width: 90px; border-radius: 20px; height: auto;" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">
                                        ${candidate.nombre}
                                        <span class="badge bg-${colorBadge} ms-2">${candidate.estado || 'Pendiente'}</span>
                                    </h5>
                                    <p class="card-text">${candidate.puesto}</p>
                                    <div class="d-flex flex-wrap">
                                        <p class="me-3"><i class="bi bi-geo-alt"></i> ${candidate.ubicacion}</p>
                                        <p class="me-3"><i class="bi bi-briefcase"></i> ${candidate.experiencia}</p>
                                        <p class="me-3"><i class="bi bi-person"></i> ${candidate.genero}</p>
                                        <p class="me-3"><i class="bi bi-book"></i> ${candidate.educacion}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- acciones -->
                           ${htmlAcciones}
                        </div>
            `
        }

    }

    public aceptarCandidato(idCandidato: number) {
        const candidato = this.filteredCandidates.find(c => c.id === idCandidato);
        if (!candidato) return;
        candidato.estado = "aceptado";
        this.renderCandidates();
    }
    public rechazarCandidato(idCandidato: number) {
        const candidato = this.filteredCandidates.find(c => c.id === idCandidato);
        if (!candidato) return;
        candidato.estado = "rechazado";
        this.renderCandidates();
    }

    private llenarModalDetalleCandidato(idCandidato: number) {
        const candidato = this.filteredCandidates.find(c => c.id === idCandidato);
        if (!candidato) return;

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