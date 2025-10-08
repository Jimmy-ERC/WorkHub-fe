import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export class ForumService {
  constructor() {}

  public static async crearForo(
    id_categoria: number,
    id_perfil: number,
    titulo: string,
    contenido: string,
    fecha: Date
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_categoria,
          id_perfil,
          titulo,
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
        message: "Foro creado correctamente",
      };
    } catch (error) {
      console.error("Error al crear el foro:", error);
      return {
        success: false,
        error: "Error al crear el foro",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

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

  public static async getForosByUserId(id: number): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/user${id}`, {
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
      const response = await fetch(`${apiUrl}/respuesta/foro/${id_foro}`, {
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

  public static async deleteForo(id_foro: number): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/${id_foro}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: "Foro eliminado correctamente",
      };
    } catch (error) {
      console.error("Error al eliminar el foro:", error);
      return {
        success: false,
        error: "Error al eliminar el foro",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async deleteRespuesta(id_respuesta: number): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/respuesta/${id_respuesta}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: "Respuesta eliminada correctamente",
      };
    } catch (error) {
      console.error("Error al eliminar la respuesta:", error);
      return {
        success: false,
        error: "Error al eliminar la respuesta",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async editarForo(
    id_foro: number,
    titulo: string,
    contenido: string
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/foro/${id_foro}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          contenido,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Foro editado correctamente",
      };
    } catch (error) {
      console.error("Error al editar el foro:", error);
      return {
        success: false,
        error: "Error al editar el foro",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async editarRespuesta(
    id_respuesta: number,
    contenido: string
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/respuesta/${id_respuesta}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contenido,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Respuesta editada correctamente",
      };
    } catch (error) {
      console.error("Error al editar la respuesta:", error);
      return {
        success: false,
        error: "Error al editar la respuesta",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}
