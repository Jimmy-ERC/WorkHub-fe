import { api } from "@/lib/api";

const apiUrl = api.baseUrl;

export class JobApplicationsServiceEnterprise {
  public static async insertarTrabajo(data: any) {
    try {
      const response = await fetch(`${apiUrl}/enterprise/trabajos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al insertar trabajo:", error);
      return {
        success: false,
        message: "Error de conexión con el servidor",
      };
    }
  }
}
