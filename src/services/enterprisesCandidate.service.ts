import { api } from "@/lib/api";
import type { EmpresaResponse } from "@/interfaces/empresa.candidate.response.interface";

const apiUrl = api.baseUrl;

export class EnterpriseCandidateService {
  constructor() {}

  public static async getEnterprises(): Promise<EmpresaResponse> {
    try {
      const response = await fetch(`${apiUrl}/candidate/empresas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      return {
        success: result.success || false,
        data: result || [],
        message:
          result.message || `Error ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      console.error("Error al consultar empresas", error);

      return {
        success: false,
        data: [],
        message: "Error al cargar empresas",
      };
    }
  }
}
