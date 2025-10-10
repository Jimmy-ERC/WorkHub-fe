import { loadUserData } from "../../lib/userDataLoader.js";
import type { EmpresaCandidate } from "@/interfaces/empresa.candidate.interface.js";
import { EnterpriseCandidateService } from "@/services/enterprisesCandidate.service.js";

export class CandidateViewEnterprisesController {
  private enterprises: EmpresaCandidate[] = [];
  private filteredEnterprises: EmpresaCandidate[] = [];

  constructor() {
    const runAll = async () => {
      await loadUserData();
      await this.loadEnterprises();
      this.renderEnterprises();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private async loadEnterprises() {
    try {
      const response = await EnterpriseCandidateService.getEnterprises();

      this.enterprises = response.data.map((item) => ({
        id_perfil: item.id_perfil,
        id_usuario: item.id_usuario,
        nombre: item.nombre || "Sin nombre",
        biografia: item.biografia || "",
        telefono: item.telefono || "",
        link_foto_perfil: item.link_foto_perfil || "",
        fecha_fundacion: item.fecha_fundacion || "",
        ubicacion: item.ubicacion || "Desconocida",
        pagina_web: item.pagina_web || "",
        red_social: item.red_social || "",
        email: item.email || "",
        seguidores: item.seguidores || [],
      }));

      this.filteredEnterprises = [...this.enterprises];

      this.renderEnterprises();
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      alert("Error de conexión al cargar empresas");
    }
  }

  public renderEnterprises(): void {
    const listEmpresas = document.getElementById("listEmpresas");

    if (!listEmpresas) {
      console.error("No se encontró el contenedor con id 'listEmpresas'");
      return;
    }

    listEmpresas.innerHTML = "";

    if (this.filteredEnterprises.length === 0) {
      listEmpresas.innerHTML = `
        <div class="text-center mt-3">
          <p>No se encontraron empresas.</p>
        </div>`;
      return;
    }

    for (const enterprise of this.filteredEnterprises) {
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

      const empresaHTML = `
        <div
          class="card flex row mb-2"
          style="
            width: 100%;
            display: flex !important;
            flex-direction: row;
            overflow: auto;
            justify-content: center;
            flex-wrap: wrap;
          "
        >
          <!-- contenido -->
          <div
            class="col-12 col-md-9 d-flex align-items-center"
            style="padding: 1%"
          >
            <img
              src="${enterprise.link_foto_perfil}"
              class="card-img-top"
              style="max-width: 90px; border-radius: 20px; height: auto"
              alt="${enterprise.nombre}"
            />
            <div class="card-body">
              <h5 class="card-title">${enterprise.nombre}</h5>
              <div class="d-flex flex-wrap">
                <p class="me-3 mb-0">
                  <i class="bi bi-geo-alt"></i>
                  ${enterprise.ubicacion || "Ubicación no disponible"}
                </p>
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
        </div>
      `;

      listEmpresas.innerHTML += empresaHTML;
    }
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
      enterprise.nombre.toLowerCase().includes(nombreBuscar)
    );
    this.renderEnterprises();
  }

  public buscarPorUbicacion(): void {
    const filtroUbicacion = (
      document.getElementById("filtroUbicacion") as HTMLInputElement
    ).value.toLocaleLowerCase();

    console.log(filtroUbicacion);

    if (!filtroUbicacion || filtroUbicacion.length === 0) {
      this.limpiarFiltros();
      return;
    }

    this.filteredEnterprises = this.filteredEnterprises.filter((e) =>
      e.ubicacion.toLocaleLowerCase().includes(filtroUbicacion)
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
    candidateViewEnterprisesController: CandidateViewEnterprisesController;
  }
}

window.candidateViewEnterprisesController =
  new CandidateViewEnterprisesController();
