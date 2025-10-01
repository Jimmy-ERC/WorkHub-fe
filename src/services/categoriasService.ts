import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export class CategoriasService {
  constructor() {}

  public static async getCategorias(): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/candidate/categorias/`, {
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
      console.error("Error fetching categorias:", error);
      return {
        success: false,
        error: "Error fetching categorias",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}
