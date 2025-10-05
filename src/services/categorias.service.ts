import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class CategoriasService {
  public static async getCategorias(): Promise<ApiResponse<any[]>> {
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

      const json = await response.json();
      const data = json.data as any[];

      return {
        success: true,
        data,
        message: json.message,
      };
    } catch (error) {
      return {
        success: false,
        error: "Error fetching categorias",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}
