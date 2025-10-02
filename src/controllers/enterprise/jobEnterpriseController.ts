import type { Job } from "@/interfaces/job.interface.js";
import { JobApplicationsServiceEnterprise } from "@/services/jobEnterprise.service";

export class JobControllerEnterprise {
  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      const form = document.getElementById(
        "form-publicar-trabajo"
      ) as HTMLFormElement;

      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          console.log("Formulario enviado");

          const data = {
            nombre: (
              document.getElementById("nombre-empleo") as HTMLInputElement
            ).value,
            etiqueta: (
              document.getElementById("etiquetas-empleo") as HTMLSelectElement
            ).value,
            salarioMinimo: (
              document.getElementById("salario-minimo") as HTMLInputElement
            ).value,
            salarioMaximo: (
              document.getElementById("salario-maximo") as HTMLInputElement
            ).value,
            educacion: (
              document.getElementById("educacion") as HTMLSelectElement
            ).value,
            experiencia: (
              document.getElementById("experiencia") as HTMLSelectElement
            ).value,
            tipoTrabajo: (
              document.getElementById("tipo-trabajo") as HTMLSelectElement
            ).value,
            fechaExpiracion: (
              document.getElementById("fecha-expiracion") as HTMLInputElement
            ).value,
            nivelTrabajo: (
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

    window.location.href = "/enterprise/home";
  }
}
