import type { Job } from "@/interfaces/job.interface.js";
import { JobApplicationsServiceEnterprise } from "@/services/jobApplicationServiceEnterprise";

export class JobControllerEnterprise {
  private job: Job[] = [];

  constructor() {
    this.init(); //Espera a que el documento esté cargado y carga tanto los datos de usuario como los trabajos
  }
  private init(): void {
    //Soluciona error desconocida de carga
    const runAll = async () => {};

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  //Insertar trabajos
  public async insertarTrabajo(data: any): Promise<void> {
    let response = await JobApplicationsServiceEnterprise.insertarTrabajo(data);

    if (!response.success) {
      alert(response.message);
      return;
    }

    window.location.href = "/enterprise/home";
  }
}
