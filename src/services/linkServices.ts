import { api } from "@/lib/api";

const apiUrl = api.baseUrl;

export class LinkService {
  constructor() {}

  public static async crearLink(
    url: string,
    id_perfil: number
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/recursos/links/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          id_perfil,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error del servidor:", data);
        return {
          success: false,
          error: data.error || "Error al crear el link",
          message: data.message || `HTTP error! status: ${response.status}`,
          data: data,
        };
      }

      return {
        success: true,
        data,
        message: "Link creado correctamente",
      };
    } catch (error) {
      console.error("Error al crear el link:", error);
      return {
        success: false,
        error: "Error al crear el link",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async getLinks(): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/recursos/links/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Links obtenidos correctamente",
      };
    } catch (error) {
      console.error("Error al obtener los links:", error);
      return {
        success: false,
        error: "Error al obtener los links",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
  static async eliminarLink(id_link: number): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${apiUrl}/recursos/links/${id_link}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en LinkService.eliminarLink:", error);
      return { success: false, message: 'Error al conectar con el servidor' };
    }
  }
}