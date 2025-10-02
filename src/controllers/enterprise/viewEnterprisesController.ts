import { JobApplicationsService } from '@/services/jobApplicationsService.js';
import { loadUserData } from '../../lib/userDataLoader.js';
import { ProfileEnterpriseService } from '@/services/profileEnterprise.service.js';
import type { ProfileResponse } from '@/interfaces/profileResponse.interface.js';
import type { Empresa } from '@/interfaces/empresa.interface.js';
import { EnterprisesEnterpriseService } from '@/services/EnterprisesEnterpriseService copy.js';
import type { EmpresaResponse } from '@/interfaces/empresaResponse.interface.js';

export class EnterpriseViewEnterprisesController {
    private enterprises: Empresa[] = [
        {
            id_seguido: 11,
            nombre_seguido: "Instagram",
            foto_seguido: "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/3cbac7ba-1995-42ce-ac79-0b30ba522831/avatar.png",
            id_seguidor: 10,
            es_seguida: true,
            ubicacion_seguido: "Estados Unidos"
        },
        {
            id_seguido: 12,
            nombre_seguido: "Twitter",
            foto_seguido: "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/4dbac7ba-1995-42ce-ac79-0b30ba522832/avatar.png",
            id_seguidor: 10,
            es_seguida: false,
            ubicacion_seguido: "Estados Unidos"
        },
        {
            id_seguido: 13,
            nombre_seguido: "LinkedIn",
            foto_seguido: "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/5ebac7ba-1995-42ce-ac79-0b30ba522833/avatar.png",
            id_seguidor: 10,
            es_seguida: true,
            ubicacion_seguido: "Estados Unidos"
        }
    ] as any[];

    private filteredEnterprises = [...this.enterprises]
    constructor() {

        //soluciona error desconocida de carga
        const runAll = async () => {
            console.log("cargando datos de empresas")
            await loadUserData();
            await this.loadEnterprises()
            this.renderEnterprises();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAll);
        } else {
            runAll();
        }

    }

    private async loadEnterprises() {





        //obtenemos el perfil de la empresa
        const enterPriseProfile = await ProfileEnterpriseService.fetchEnterpriseProfile() as ProfileResponse;
        if (!enterPriseProfile.success) {
            alert(enterPriseProfile.message);
            return;
        }

        const enterPrises = await EnterprisesEnterpriseService.getEnterprises(enterPriseProfile.data.id_perfil) as EmpresaResponse;

        if (enterPrises.success) {
            this.enterprises = enterPrises.data;
            this.filteredEnterprises = [...this.enterprises];
            this.renderEnterprises();
        }
        else {
            console.error("Error loading enterprises:", enterPrises.message);
            alert(enterPrises.message || "Error al cargar empresas");
        }

    }
    public renderEnterprises(): void {

        const listCandidatos = document.getElementById('listCandidatos');
        if (!listCandidatos) return;
        listCandidatos.innerHTML = ``;
        for (const enterprise of this.filteredEnterprises) {

            let htmlAcciones = ``

            //TODO: distinguir si la empresa ya se sigue o no
            if (enterprise.es_seguida) {
                htmlAcciones = ` <div
                                class="col-12 col-sm-12 col-md-12 col-lg-3 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                               <button type="button" style="background-color: #E7F0FA; color: #0A65CC; border: none;"
                                    class="btn btn-primary w-100 w-md-auto">Siguiendo <i class="bi bi-check"></i></button>
                            </div>`
            }
            else {
                htmlAcciones = ` <div
                                class="col-12 col-sm-12 col-md-12 col-lg-3 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                                <button type="button" style="background-color: #E7F0FA; color: #0A65CC; border: none;"
                                    class="btn btn-primary w-100 w-md-auto">Seguir →</button>
                            </div>`
            }
            listCandidatos.innerHTML += `  <div class="card flex row mb-2"
                            style="width: 100%; display:flex !important; flex-direction:row; overflow: auto; justify-content: center; flex-wrap: wrap; padding-left:3%;">
                            <!-- contenido  -->
                            <div class="col-12 col-sm-12 col-md-12 col-lg-9 d-flex align-items-center" style="padding: 1%;">
                                <img src="${enterprise.foto_seguido}" class="card-img-top"
                                    style="max-width: 90px; border-radius: 20px; height: auto;" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">
                                        ${enterprise.nombre_seguido}

                                    </h5>
                                    <div class="d-flex flex-wrap">
                                        <p class="me-3"><i class="bi bi-geo-alt"></i> ${enterprise.ubicacion_seguido}</p>
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
            await this.loadEnterprises()
            this.renderEnterprises();
        }
        else {
            alert(response.message || "Error al actualizar estado de la aplicación");
        }
    }


}


// Crear instancia global para acceso desde HTML
declare global {
    interface Window {
        enterpriseViewEnterprisesController: EnterpriseViewEnterprisesController;
    }
}

window.enterpriseViewEnterprisesController = new EnterpriseViewEnterprisesController();