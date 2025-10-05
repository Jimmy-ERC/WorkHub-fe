// jobControllerEnterprise.ts
import type { Job } from "@/interfaces/job.interface.js";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { JobApplicationsServiceEnterprise } from "@/services/jobEnterprise.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

export class JobControllerEnterprise {
  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      const response =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      const form = document.getElementById(
        "form-publicar-trabajo"
      ) as HTMLFormElement;

      console.log("ID del perfil de la empresa:", response.data.id_perfil);

      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          console.log("Formulario enviado para publicar trabajo");

          const data = {
            id_perfil: response.data.id_perfil,
            nombre_trabajo: (
              document.getElementById("nombre-empleo") as HTMLInputElement
            ).value,
            id_categoria: parseInt(
              (document.getElementById("etiquetas-empleo") as HTMLSelectElement)
                .value
            ),
            salario_minimo: parseFloat(
              (document.getElementById("salario-minimo") as HTMLInputElement)
                .value
            ),
            salario_maximo: parseFloat(
              (document.getElementById("salario-maximo") as HTMLInputElement)
                .value
            ),
            educacion: (
              document.getElementById("educacion") as HTMLSelectElement
            ).value,
            experiencia: (
              document.getElementById("experiencia") as HTMLSelectElement
            ).value,
            modalidad: (
              document.getElementById("tipo-trabajo") as HTMLSelectElement
            ).value,
            fecha_expiracion: (
              document.getElementById("fecha-expiracion") as HTMLInputElement
            ).value,
            nivel: (
              document.getElementById("nivel-trabajo") as HTMLSelectElement
            ).value,
            descripcion: (
              document.getElementById(
                "descripcion-empleo"
              ) as HTMLTextAreaElement
            ).value,
            responsabilidades: (
              document.getElementById(
                "responsabilidades-empleo"
              ) as HTMLTextAreaElement
            ).value,
            ubicacion: response.data.ubicacion,
          };

          await this.insertarTrabajo(data);
        });
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  public async insertarTrabajo(data: any): Promise<Job | void> {
    let response = await JobApplicationsServiceEnterprise.insertarTrabajo(data);

    if (!response.success) {
      alert(response.message);

      return;
    }

    // Redirigir al archivo HTML correcto dentro de la carpeta src/pages/enterprise
    window.location.href = "/src/pages/enterprise/home.html";
  }
}

declare global {
  interface Window {
    jobControllerEnterprise: JobControllerEnterprise;
  }
}

window.jobControllerEnterprise = new JobControllerEnterprise();
