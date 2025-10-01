import type { JobsResponse } from "@/interfaces/jobsResponse";
import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export class JobApplicationsServiceEnterprise {
  constructor() {}

  public static async insertarTrabajo(data: any): Promise<JobsResponse> {
    const response = await fetch(`${apiUrl}/enterprise/trabajos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    return (data = await response.json());
  }

  public static async actualizarTrabajo(
    id: string,
    data: any
  ): Promise<JobsResponse> {
    const response = await fetch(`${apiUrl}/enterprise/trabajos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    return (data = await response.json());
  }

  public static async eliminarTrabajo(id: string): Promise<JobsResponse> {
    const response = await fetch(`${apiUrl}/enterprise/trabajos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }
}
