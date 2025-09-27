import { loadUserData } from '../../lib/userDataLoader.js';

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
            estado: "pendiente",
            estadoCivil: "Soltera",
            fechaNacimiento: "1994-05-12",
            nacionalidad: "Mexicana",
            cvUrl: "https://workhub-cv.com/cv/ana-martinez.pdf",
            email: "ana.martinez@email.com",
            sitioWeb: "https://ana-martinez.com",
            telefono: "+52 55 1234 5678",
            biografia: "Diseñadora de interacción apasionada por crear experiencias digitales intuitivas y accesibles. Con experiencia en proyectos de diseño centrado en el usuario y prototipado rápido.",
            cartaPresentacion: "Me encantaría formar parte de su equipo para aportar mi creatividad y habilidades en diseño de interacción, ayudando a mejorar la experiencia de sus usuarios.",
            redSocial: "https://twitter.com/ana_martinez"
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
            estado: "pendiente",
            estadoCivil: "Casado",
            fechaNacimiento: "1992-11-03",
            nacionalidad: "Mexicana",
            cvUrl: "https://workhub-cv.com/cv/pedro-ramirez.pdf",
            email: "pedro.ramirez@email.com",
            sitioWeb: "https://pedro-ramirez.com",
            telefono: "+52 33 2345 6789",
            biografia: "Diseñador técnico con enfoque en la interacción digital y la usabilidad. Experiencia en diseño de interfaces y pruebas de usuario.",
            cartaPresentacion: "Estoy motivado para contribuir con mi conocimiento técnico y mi pasión por el diseño a su empresa, asegurando productos funcionales y atractivos.",
            redSocial: "https://linkedin.com/in/pedro-ramirez"
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
            estado: "pendiente",
            estadoCivil: "Soltero",
            fechaNacimiento: "1990-08-21",
            nacionalidad: "Colombiana",
            cvUrl: "https://workhub-cv.com/cv/carlos-gomez.pdf",
            email: "carlos.gomez@email.com",
            sitioWeb: "https://carlos-gomez.com",
            telefono: "+57 1 345 6789",
            biografia: "Ingeniero de software con sólida experiencia en desarrollo backend y frontend. Apasionado por la resolución de problemas y la mejora continua.",
            cartaPresentacion: "Me gustaría aportar mi experiencia en desarrollo de software y mi capacidad de trabajo en equipo para impulsar los proyectos tecnológicos de su empresa.",
            redSocial: "https://github.com/carlosgomez"
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
            estado: "pendiente",
            estadoCivil: "Soltera",
            fechaNacimiento: "1995-02-14",
            nacionalidad: "Ecuatoriana",
            cvUrl: "https://workhub-cv.com/cv/sofia-herrera.pdf",
            email: "sofia.herrera@email.com",
            sitioWeb: "https://sofia-herrera.com",
            telefono: "+593 2 456 7890",
            biografia: "Desarrolladora de software enfocada en aplicaciones web y móviles. Interesada en la innovación tecnológica y el aprendizaje constante.",
            cartaPresentacion: "Estoy interesada en unirme a su equipo para aportar mis conocimientos en desarrollo y mi entusiasmo por los nuevos retos tecnológicos.",
            redSocial: "https://twitter.com/sofia_herrera"
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
            estado: "pendiente",
            estadoCivil: "Casada",
            fechaNacimiento: "1988-09-30",
            nacionalidad: "Española",
            cvUrl: "https://workhub-cv.com/cv/lucia-fernandez.pdf",
            email: "lucia.fernandez@email.com",
            sitioWeb: "https://lucia-fernandez.com",
            telefono: "+34 91 123 4567",
            biografia: "Especialista en marketing con experiencia en campañas digitales y gestión de equipos. Orientada a resultados y a la innovación en estrategias de mercado.",
            cartaPresentacion: "Me gustaría aportar mi experiencia en marketing y liderazgo para contribuir al crecimiento y posicionamiento de su empresa.",
            redSocial: "https://linkedin.com/in/lucia-fernandez"
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
            estado: "pendiente",
            estadoCivil: "Soltero",
            fechaNacimiento: "1993-04-18",
            nacionalidad: "Española",
            cvUrl: "https://workhub-cv.com/cv/javier-ruiz.pdf",
            email: "javier.ruiz@email.com",
            sitioWeb: "https://javier-ruiz.com",
            telefono: "+34 93 234 5678",
            biografia: "Joven profesional del marketing con habilidades en redes sociales y análisis de mercado. Proactivo y con gran capacidad de aprendizaje.",
            cartaPresentacion: "Deseo aportar mi energía y mis conocimientos en marketing digital para ayudar a su empresa a alcanzar nuevos públicos.",
            redSocial: "https://twitter.com/javierruiz"
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
            estado: "pendiente",
            estadoCivil: "Casado",
            fechaNacimiento: "1985-12-07",
            nacionalidad: "Peruana",
            cvUrl: "https://workhub-cv.com/cv/miguel-torres.pdf",
            email: "miguel.torres@email.com",
            sitioWeb: "https://miguel-torres.com",
            telefono: "+51 1 567 8901",
            biografia: "Diseñador UX senior con amplia experiencia en investigación de usuarios y diseño de productos digitales de alto impacto.",
            cartaPresentacion: "Estoy interesado en liderar proyectos de experiencia de usuario en su empresa, aportando mi visión estratégica y mi experiencia en el sector.",
            redSocial: "https://linkedin.com/in/migueltorres"
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
            estado: "pendiente",
            estadoCivil: "Soltera",
            fechaNacimiento: "1991-07-25",
            nacionalidad: "Chilena",
            cvUrl: "https://workhub-cv.com/cv/valentina-lopez.pdf",
            email: "valentina.lopez@email.com",
            sitioWeb: "https://valentina-lopez.com",
            telefono: "+56 2 678 9012",
            biografia: "Profesional en diseño UX con experiencia en metodologías ágiles y diseño centrado en el usuario. Creativa y orientada a resultados.",
            cartaPresentacion: "Me gustaría contribuir con mi experiencia en UX y mi creatividad para mejorar la experiencia digital de sus clientes.",
            redSocial: "https://twitter.com/valenlopez"
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
            estado: "pendiente",
            estadoCivil: "Soltero",
            fechaNacimiento: "1996-03-10",
            nacionalidad: "Mexicana",
            cvUrl: "https://workhub-cv.com/cv/luis-castillo.pdf",
            email: "luis.castillo@email.com",
            sitioWeb: "https://luis-castillo.com",
            telefono: "+52 81 3456 7890",
            biografia: "Diseñador de interacción con experiencia en prototipado y pruebas de usabilidad. Apasionado por la tecnología y el diseño funcional.",
            cartaPresentacion: "Quiero aportar mi entusiasmo y mis conocimientos en diseño de interacción para crear productos digitales efectivos en su empresa.",
            redSocial: "https://linkedin.com/in/luiscastillo"
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
            estado: "pendiente",
            estadoCivil: "Soltera",
            fechaNacimiento: "1997-10-05",
            nacionalidad: "Colombiana",
            cvUrl: "https://workhub-cv.com/cv/andrea-morales.pdf",
            email: "andrea.morales@email.com",
            sitioWeb: "https://andrea-morales.com",
            telefono: "+57 4 234 5678",
            biografia: "Ingeniera de software junior con interés en el desarrollo web y la mejora de procesos. Dispuesta a aprender y crecer profesionalmente.",
            cartaPresentacion: "Me gustaría unirme a su equipo para desarrollar mis habilidades y contribuir al éxito de sus proyectos tecnológicos.",
            redSocial: "https://twitter.com/andreamorales"
        }
    ]

    private filteredCandidates = [...this.candidates]
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log("cargando datos de candidatos")
            await loadUserData();
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
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="enterpriseViewCandidatesController.llenarModalDetalleCandidato(${candidate.id})">Ver Perfil →</button>
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
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="enterpriseViewCandidatesController.llenarModalDetalleCandidato(${candidate.id})">Ver Perfil →</button>
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

    public llenarModalDetalleCandidato(idCandidato: number) {
        const candidato = this.filteredCandidates.find(c => c.id === idCandidato);
        if (!candidato) return;

        // Foto y nombre
        const foto = document.getElementById('fotoCandidato') as HTMLImageElement;
        if (foto) foto.src = candidato.fotoUrl;

        const nombre = document.getElementById('nombreCandidato');
        if (nombre) nombre.textContent = candidato.nombre;

        // Género
        const genero = document.getElementById('generoCandidato');
        if (genero) genero.textContent = candidato.genero;

        // Experiencia
        const experiencia = document.getElementById('experienciaCandidato');
        if (experiencia) experiencia.textContent = candidato.experiencia;

        // Educación
        const educacion = document.getElementById('EducacionCandidato');
        if (educacion) educacion.textContent = candidato.educacion;

        // Fecha de nacimiento
        const nacimiento = document.getElementById('nacimientoCandidato');
        if (nacimiento) nacimiento.textContent = candidato.fechaNacimiento;

        // Nacionalidad
        const nacionalidad = document.getElementById('nacionalidadCandidato');
        if (nacionalidad) nacionalidad.textContent = candidato.nacionalidad;

        // Estado civil
        const estadoCivil = document.getElementById('estadoCivilCandidato');
        if (estadoCivil) estadoCivil.textContent = candidato.estadoCivil;

        // Nombre del PDF y enlace de descarga
        const nombreCandidatoPDF = document.getElementById('nombreCandidatoPDF');
        if (nombreCandidatoPDF) nombreCandidatoPDF.textContent = candidato.nombre;

        const descargaCVCandidato = document.getElementById('descargaCVCandidato') as HTMLAnchorElement;
        if (descargaCVCandidato) {

            descargaCVCandidato.href = candidato.cvUrl;
            descargaCVCandidato.download = `${candidato.nombre.replace(/\s+/g, '_').toLowerCase()}_cv.pdf`;
        }



        // Sitio web
        const sitioWeb = document.querySelector('#modalDetalleCandidato .bi-globe')?.parentElement?.querySelector('p.fw-bold');
        if (sitioWeb) sitioWeb.textContent = candidato.sitioWeb;

        // Ubicación (en la sección de contacto)
        const ubicacionContacto = document.querySelector('#modalDetalleCandidato .bi-geo-alt')?.parentElement?.querySelector('p.fw-bold');
        if (ubicacionContacto) ubicacionContacto.textContent = candidato.ubicacion;

        // Teléfono
        const telefono = document.querySelector('#modalDetalleCandidato .bi-telephone')?.parentElement?.querySelector('p.fw-bold');
        if (telefono) telefono.textContent = candidato.telefono;

        // Correo electrónico
        const correo = document.querySelector('#modalDetalleCandidato .bi-envelope')?.parentElement?.querySelector('p.fw-bold');
        if (correo) correo.textContent = candidato.email;

        // Biografía y carta de presentación (si existieran en el objeto candidato)
        const biografia = document.getElementById('biografiaCandidato');
        console.log(biografia)
        if (biografia) biografia.textContent = (candidato as any).biografia || "No disponible.";

        const cartaPresentacion = document.getElementById('cartaPresentacionCandidato');
        if (cartaPresentacion) cartaPresentacion.textContent = (candidato as any).cartaPresentacion || "No disponible.";


        //boton para enviar correo;
        const enviarCorreoCandidato = document.getElementById('enviarCorreoCandidato') as HTMLAnchorElement;
        if (enviarCorreoCandidato) enviarCorreoCandidato.href = `mailto:${candidato.email}`;

        //icono red social
        const redSocialIconoCandidato = document.getElementById('redSocialIconoCandidato') as HTMLAnchorElement;
        //limpiamos las clases anteriores
        redSocialIconoCandidato.classList.remove(...redSocialIconoCandidato.classList);

        //añadimos el icono segun la red social
        if (candidato.redSocial.includes("twitter")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-twitter');
        }
        else if (candidato.redSocial.includes("linkedin")) {

            redSocialIconoCandidato.classList.add('bi', 'bi-linkedin');
        }
        else if (candidato.redSocial.includes("facebook")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-facebook');
        }
        else if (candidato.redSocial.includes("github")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-github');
        }
        else {
            redSocialIconoCandidato.classList.add('bi', 'bi-globe');
        }

        //añadimos el enlace a la red social
        const redSocialCandidato = document.getElementById('redSocialCandidato') as HTMLAnchorElement;
        if (redSocialCandidato) redSocialCandidato.href = candidato.redSocial;
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