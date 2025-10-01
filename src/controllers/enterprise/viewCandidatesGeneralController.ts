import { JobApplicationsService } from '@/services/jobApplicationsService.js';
import { loadUserData } from '../../lib/userDataLoader.js';
import { ProfileEnterpriseService } from '@/services/profileEnterprise.service.js';
import type { ProfileResponse } from '@/interfaces/profileResponse.interface.js';

export class EnterpriseViewCandidatesGeneralController {
    private candidates = [
        {
            id_perfil: 11,
            id_aplicacion: 5,
            id_trabajo: 10,
            nombre: "Instagram",
            id_usuario: "3cbac7ba-1995-42ce-ac79-0b30ba522831",
            nombre_trabajo: "Desarrollador Backend",
            ubicacion: "San Francisco, CA",
            experiencia: "1 - 2 años",
            educacion: "Ingeniería",
            genero: "masculino",
            estado: "Pendiente",
            estado_civil: "soltero",
            fecha_nacimiento_fundacion: "2025-09-17T06:00:00.000Z",
            url_curriculum: "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/3cbac7ba-1995-42ce-ac79-0b30ba522831/cv.pdf",
            email: "instagram@gmail.com",
            pagina_web: "https://www.instagram.com/",
            telefono: "7061-2813",
            biografia: "Instagram es una red social y aplicación móvil gratuita de Meta que permite a los usuarios compartir fotos y vídeos, personalizarlos con efectos y filtros, y publicarlos en sus perfiles para que los sigan otras personas o grupos",
            red_social: "https://www.instagram.com/instagram/",
            fotoUrl: "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/3cbac7ba-1995-42ce-ac79-0b30ba522831/avatar.png"
        }
    ]

    private filteredCandidates = [...this.candidates]
    constructor() {

        //soluciona error desconocida de carga
        const runAll = async () => {
            console.log("cargando datos de candidatos")
            await loadUserData();
            await this.loadCandidates()
            this.renderCandidates();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAll);
        } else {
            runAll();
        }

    }

    private async loadCandidates() {



        //obtenemos el perfil de la empresa
        const enterPriseProfile = await ProfileEnterpriseService.fetchEnterpriseProfile() as ProfileResponse;
        if (!enterPriseProfile.success) {
            alert(enterPriseProfile.message);
            return;
        }
        //obtenemos los candidatos
        const candidates = await JobApplicationsService.getApplicationsByEnterpriseId(enterPriseProfile.data.id_perfil) as any;
        console.log("Candidatos obtenidos:", candidates);
        if (candidates.success) {
            this.candidates = candidates.data;
            this.filteredCandidates = [...this.candidates];
            this.renderCandidates();
        }
        else {
            console.error("Error loading candidates:", candidates.message);
            alert(candidates.message || "Error al cargar candidatos");
        }
    }
    public renderCandidates(): void {

        //filatramos por experiencia
        //==============================
        this.filteredCandidates = [...this.candidates];
        let experiencia = (document.querySelector('input[name="experiencia"]:checked') as HTMLInputElement)?.value + "";
        experiencia = experiencia.toLowerCase();
        if (experiencia) {
            console.log("filtrando por experiencia: " + experiencia);
            if (experiencia !== 'todos') {
                this.filteredCandidates = this.filteredCandidates.filter(c => {
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
                this.filteredCandidates = this.filteredCandidates.filter(c => valoresEducacion.includes(c.educacion.toLowerCase()))
                console.log("candidatos despues de filtrar por educacion: ", this.filteredCandidates);
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
                this.filteredCandidates = this.filteredCandidates.filter(c => c.genero.toLowerCase() === valorGenero)
            }
        }


        document.getElementById('nombreVacante')!.innerText = this.filteredCandidates[0]?.nombre_trabajo || 'Puesto no especificado';
        const listCandidatos = document.getElementById('listCandidatos');
        if (!listCandidatos) return;
        listCandidatos.innerHTML = ``;
        for (const candidate of this.filteredCandidates) {

            //verificamos si el siguiente pertenece a un trabajo distinto
            if (this.filteredCandidates.indexOf(candidate) > 0) {
                if (candidate.id_trabajo !== this.filteredCandidates[this.filteredCandidates.indexOf(candidate) - 1]?.id_trabajo) {
                    listCandidatos.appendChild(document.createElement('hr'));
                    listCandidatos.innerHTML += `<h5 id="nombreVacante">${candidate.nombre_trabajo}</h5>`;
                }
            }
            let colorBadge;
            switch (candidate.estado?.toLowerCase()) {
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
            if (candidate.estado?.toLowerCase() === "pendiente") {
                htmlAcciones = `<div
                                class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="enterpriseViewCandidatesController.llenarModalDetalleCandidato(${candidate.id_perfil})">Ver Perfil →</button>
                                <button type="button" class="btn btn-success w-100 w-md-auto"  onClick="enterpriseViewCandidatesGeneralController.actualizarEstadoAplicacion(${candidate.id_aplicacion}, 'aceptado')">
                                    Aceptar <i class="bi bi-check"></i>
                                </button>
                                <button type="button" class="btn btn-danger w-100 w-md-auto"  onClick="enterpriseViewCandidatesGeneralController.actualizarEstadoAplicacion(${candidate.id_aplicacion}, 'rechazado')">
                                   Rechazar <i class="bi bi-x"></i>
                                </button>
                            </div>`
            }
            else {
                htmlAcciones = `<div
                                class="col-12 col-sm-12 col-md-12 col-lg-2 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                                <button data-bs-toggle="modal"  data-bs-target="#modalDetalleCandidato" type="button" class="btn btn-primary w-100 w-md-auto" onClick="enterpriseViewCandidatesGeneralController.llenarModalDetalleCandidato(${candidate.id_perfil})">Ver Perfil →</button>
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
                                    <p class="card-text">${candidate.nombre_trabajo}</p>
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

    public async actualizarEstadoAplicacion(idAplicacion: number, status: string) {
        const response = await JobApplicationsService.updateApplicationStatus(idAplicacion, status);
        if (response.success) {
            await this.loadCandidates()
            this.renderCandidates();
        }
        else {
            alert(response.message || "Error al actualizar estado de la aplicación");
        }
    }


    public llenarModalDetalleCandidato(idCandidato: number) {
        const candidato = this.filteredCandidates.find(c => c.id_perfil === idCandidato);
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
        if (nacimiento) nacimiento.textContent = new Date(candidato.fecha_nacimiento_fundacion).toLocaleDateString();

        // Nacionalidad
        const nacionalidad = document.getElementById('nacionalidadCandidato');
        // No hay nacionalidad en la nueva estructura
        if (nacionalidad) nacionalidad.textContent = "-";

        // Estado civil
        const estadoCivil = document.getElementById('estadoCivilCandidato');
        if (estadoCivil) estadoCivil.textContent = candidato.estado_civil;

        // Nombre del PDF y enlace de descarga
        const nombreCandidatoPDF = document.getElementById('nombreCandidatoPDF');
        if (nombreCandidatoPDF) nombreCandidatoPDF.textContent = candidato.nombre;

        const descargaCVCandidato = document.getElementById('descargaCVCandidato') as HTMLAnchorElement;
        if (descargaCVCandidato) {
            descargaCVCandidato.href = candidato.url_curriculum;
            descargaCVCandidato.download = `${candidato.nombre.replace(/\s+/g, '_').toLowerCase()}_cv.pdf`;
        }



        // Sitio web
        const sitioWeb = document.querySelector('#modalDetalleCandidato .bi-globe')?.parentElement?.querySelector('p.fw-bold');
        if (sitioWeb) sitioWeb.textContent = candidato.pagina_web;

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
        if (biografia) biografia.textContent = candidato.biografia || "No disponible.";

        const cartaPresentacion = document.getElementById('cartaPresentacionCandidato');
        if (cartaPresentacion) cartaPresentacion.textContent = "No disponible.";


        //boton para enviar correo;
        const enviarCorreoCandidato = document.getElementById('enviarCorreoCandidato') as HTMLAnchorElement;
        if (enviarCorreoCandidato) enviarCorreoCandidato.href = `mailto:${candidato.email}`;

        //icono red social
        const redSocialIconoCandidato = document.getElementById('redSocialIconoCandidato') as HTMLAnchorElement;
        //limpiamos las clases anteriores
        redSocialIconoCandidato.classList.remove(...redSocialIconoCandidato.classList);
        //añadimos el icono segun la red social
        if (candidato.red_social.includes("twitter")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-twitter');
        }
        else if (candidato.red_social.includes("linkedin")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-linkedin');
        }
        else if (candidato.red_social.includes("facebook")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-facebook');
        }
        else if (candidato.red_social.includes("github")) {
            redSocialIconoCandidato.classList.add('bi', 'bi-github');
        }
        else {
            redSocialIconoCandidato.classList.add('bi', 'bi-globe');
        }

        //añadimos el enlace a la red social
        const redSocialCandidato = document.getElementById('redSocialCandidato') as HTMLAnchorElement;
        if (redSocialCandidato) redSocialCandidato.href = candidato.red_social;
    }
}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseViewCandidatesGeneralController: EnterpriseViewCandidatesGeneralController;
    }
}

window.enterpriseViewCandidatesGeneralController = new EnterpriseViewCandidatesGeneralController();