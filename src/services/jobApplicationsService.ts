import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;
export class JobApplicationsService {
  constructor() {}

  public static async getApplicationsByJobId(jobId: number): Promise<any> {
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/aplicaciones/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      return {
        success: data.success || false,
        data: data.data || [],
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      console.error("Error al consultar trabajos", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al consultar trabajos",
      };
    }
  }

  public static async getApplicationsByEnterpriseId(
    enterpriseId: number
  ): Promise<any> {
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/aplicaciones/by-empresa/${enterpriseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      return {
        success: data.success || false,
        data: data.data || [],
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      console.error("Error al consultar trabajos", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al consultar trabajos",
      };
    }
  }

  public static async updateApplicationStatus(
    application_id: number,
    status: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/aplicaciones/${application_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nuevo_estado: status }),
        }
      );

      const data = await response.json();

      return {
        success: data.success || false,
        data: data.data || [],
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      console.error("Error al actualizar el estado de la aplicación", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al actualizar el estado de la aplicación",
      };
    }
  }
}
