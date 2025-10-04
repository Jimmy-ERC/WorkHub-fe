import { JobApplicationsService } from "@/services/jobApplicationsService.js";
import { loadUserData } from "../../lib/userDataLoader.js";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service.js";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface.js";
import type { Empresa } from "@/interfaces/empresa.interface.js";
import { EnterprisesEnterpriseService } from "@/services/EnterprisesEnterpriseService.js";
import type { EmpresaResponse } from "@/interfaces/empresaResponse.interface.js";
import { ProfileCandidateService } from "@/services/profileCandidate.service.js";

export class EnterpriseViewEnterprisesController {
  private enterprises: Empresa[] = [
    {
      id_seguido: 11,
      nombre_seguido: "Instagram",
      foto_seguido:
        "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/3cbac7ba-1995-42ce-ac79-0b30ba522831/avatar.png",
      id_seguidor: 10,
      es_seguida: true,
      ubicacion_seguido: "Estados Unidos",
      te_sigue: false,
    },
    {
      id_seguido: 12,
      nombre_seguido: "Twitter",
      foto_seguido:
        "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/4dbac7ba-1995-42ce-ac79-0b30ba522832/avatar.png",
      id_seguidor: 10,
      es_seguida: false,
      ubicacion_seguido: "Estados Unidos",
      te_sigue: true,
    },
    {
      id_seguido: 13,
      nombre_seguido: "LinkedIn",
      foto_seguido:
        "https://pzplniihhetjlxdkhljz.supabase.co/storage/v1/object/public/Archivos_WorkHub/5ebac7ba-1995-42ce-ac79-0b30ba522833/avatar.png",
      id_seguidor: 10,
      es_seguida: true,
      ubicacion_seguido: "Estados Unidos",
      te_sigue: false,
    },
  ] as Empresa[];

  private filteredEnterprises = [...this.enterprises];
  constructor() {
    //soluciona error desconocida de carga
    const runAll = async () => {
      console.log("cargando datos de empresas");
      await loadUserData();
      await this.loadEnterprises();
      this.renderEnterprises();

      ProfileCandidateService.fetchCandidateProfile();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private async loadEnterprises() {
    //obtenemos el perfil de la empresa
    const enterPriseProfile =
      (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
    if (!enterPriseProfile.success) {
      alert(enterPriseProfile.message);
      return;
    }

    const enterPrises = (await EnterprisesEnterpriseService.getEnterprises(
      enterPriseProfile.data.id_perfil
    )) as EmpresaResponse;

    console.log("Empresas cargadas:", enterPrises);

    if (enterPrises.success) {
      this.enterprises = enterPrises.data;
      this.filteredEnterprises = [...this.enterprises];
      this.renderEnterprises();
    } else {
      console.error("Error loading enterprises:", enterPrises.message);
      alert(enterPrises.message || "Error al cargar empresas");
    }
  }
  public renderEnterprises(): void {
    const listCandidatos = document.getElementById("listCandidatos");
    if (!listCandidatos) return;
    listCandidatos.innerHTML = ``;
    for (const enterprise of this.filteredEnterprises) {
      let htmlAcciones = ``;

      if (enterprise.es_seguida) {
        htmlAcciones = `<div
                    class="col-12 col-sm-12 col-md-12 col-lg-3 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                    <button onClick="enterpriseViewEnterprisesController.actualizarSeguimiento(${enterprise.id_seguido},${enterprise.es_seguida})" type="button" style="background-color: #E7F0FA; color: #0A65CC; border: none;"
                        class="btn btn-primary w-100 w-md-auto">Siguiendo <i class="bi bi-check"></i></button>
                </div>`;
      } else {
        htmlAcciones = `<div
                    class="col-12 col-sm-12 col-md-12 col-lg-3 d-flex justify-content-md-end justify-content-center align-items-center mb-2 mb-md-0 flex-column" style="align-self: center; gap: 5px;">
                    <button onClick="enterpriseViewEnterprisesController.actualizarSeguimiento(${enterprise.id_seguido},${enterprise.es_seguida})" type="button" style="background-color: #E7F0FA; color: #0A65CC; border: none;"
                        class="btn btn-primary w-100 w-md-auto">Seguir →</button>
                </div>`;
      }

      // Seguidores message
      let seguidoresMsg = "";
      const seguidores: Array<{ nombre: string }> = Array.isArray(
        enterprise.seguidores
      )
        ? enterprise.seguidores
        : [];
      if (seguidores.length > 0) {
        const nombres = seguidores.map((s) => s.nombre);
        if (seguidores.length === 1) {
          seguidoresMsg = `${nombres[0]} la sigue`;
        } else if (seguidores.length === 2) {
          seguidoresMsg = `${nombres[0]} y ${nombres[1]} la siguen`;
        } else if (seguidores.length === 3) {
          seguidoresMsg = `${nombres[0]}, ${nombres[1]} y ${nombres[2]} la siguen`;
        } else {
          seguidoresMsg = `${nombres[0]}, ${nombres[1]}, ${
            nombres[2]
          } y otros ${seguidores.length - 3} la siguen`;
        }
      }

      listCandidatos.innerHTML += `<div class="card flex row mb-2"
                style="width: 100%; display:flex !important; flex-direction:row; overflow: auto; justify-content: center; flex-wrap: wrap; padding-left:3%;">
                <!-- contenido  -->
                <div class="col-12 col-sm-12 col-md-12 col-lg-9 d-flex align-items-center" style="padding: 1%;">
                    <img src="${enterprise.foto_seguido}" class="card-img-top"
                        style="max-width: 90px; border-radius: 20px; height: auto;" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${enterprise.nombre_seguido}
                        </h5>
                        <div class="d-flex flex-wrap align-items-center">
                            <p class="me-3 mb-0"><i class="bi bi-geo-alt"></i> ${
                              enterprise.ubicacion_seguido
                            }</p>
                            ${
                              enterprise.te_sigue
                                ? `<span style="
                                    background: #e6f9f0;
                                    color: #16a34a;
                                    border-radius: 4px;
                                    padding: 2px 10px;
                                    margin-left: 10px;
                                    font-size: 0.92em;
                                    font-weight: 500;
                                    box-shadow: 0 0 0 1px #b6f3d3;
                                    vertical-align: middle;
                                    display: inline-block;
                                    line-height: 1.6;
                                ">Te sigue</span>`
                                : ""
                            }
                        </div>
                        ${
                          seguidoresMsg
                            ? `<div style="font-size: 0.95em; color: #555; margin-top: 4px;">
                                <i class="bi bi-people"></i> ${seguidoresMsg}
                            </div>`
                            : ""
                        }
                    </div>
                </div>
                <!-- acciones -->
                ${htmlAcciones}
            </div>`;
    }
  }

  public async actualizarSeguimiento(
    enterpriseId: number,
    es_seguida: boolean
  ): Promise<void> {
    const response =
      (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
    if (!response.success) {
      alert(response.message);
      return;
    }
    const id_seguidor = response.data.id_perfil;

    let seguimientoResponse;
    if (es_seguida) {
      seguimientoResponse =
        await EnterprisesEnterpriseService.dejarDeSeguirEmpresa(
          id_seguidor,
          enterpriseId
        );
    } else {
      seguimientoResponse = await EnterprisesEnterpriseService.seguirEmpresa(
        id_seguidor,
        enterpriseId
      );
    }
    if (!seguimientoResponse.success) {
      alert(seguimientoResponse.message);
    }

    await this.loadEnterprises();

    this.renderEnterprises();
  }

  public buscarPorNombre(): void {
    const filtroNombreInput = document.getElementById(
      "filtroNombre"
    ) as HTMLInputElement;
    if (!filtroNombreInput) return;
    const nombreBuscar = filtroNombreInput.value.toLowerCase().trim();

    if (!nombreBuscar || nombreBuscar.length === 0) {
      this.limpiarFiltros();
      return;
    }

    this.filteredEnterprises = this.filteredEnterprises.filter((enterprise) =>
      enterprise.nombre_seguido.toLowerCase().includes(nombreBuscar)
    );
    this.renderEnterprises();
  }

  public buscarPorUbicacion(): void {
    const filtroUbicacion = (
      document.getElementById("filtroUbicacion") as HTMLInputElement
    ).value.toLocaleLowerCase();
    if (!filtroUbicacion || filtroUbicacion.length === 0) {
      this.limpiarFiltros();
      return;
    }

    this.filteredEnterprises = this.filteredEnterprises.filter((e) =>
      e.ubicacion_seguido.toLocaleLowerCase().includes(filtroUbicacion)
    );
    this.renderEnterprises();
  }
  public limpiarFiltros(): void {
    this.filteredEnterprises = [...this.enterprises];
    this.renderEnterprises();
  }
}

// Crear instancia global para acceso desde HTML
declare global {
  interface Window {
    enterpriseViewEnterprisesController: EnterpriseViewEnterprisesController;
  }
}

window.enterpriseViewEnterprisesController =
  new EnterpriseViewEnterprisesController();
