import { api } from "@/lib/api";
import { NavigatorLockAcquireTimeoutError } from "@supabase/supabase-js";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export class ForumService {
  constructor() {}

  public static async getForos(): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/`, {
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
      };
    } catch (error) {
      console.error("Error fetching foros:", error);
      return {
        success: false,
        error: "Error fetching foros",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async getRespuestasByForoId(id_foro: number): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/${id_foro}`, {
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
      };
    } catch (error) {
      console.error("Error fetching respuestas:", error);
      return {
        success: false,
        error: "Error fetching respuestas",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async crearRespuesta(
    id_foro: number,
    id_perfil: number,
    contenido: string,
    fecha: Date
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/respuesta/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_foro,
          id_perfil,
          contenido,
          fecha,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Respuesta creada correctamente",
      };
    } catch (error) {
      console.error("Error al crear la respuesta:", error);
      return {
        success: false,
        error: "Error al crear la respuesta",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}
