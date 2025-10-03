import type { Empresa } from "@/interfaces/empresa.interface";
import type { EmpresaResponse } from "@/interfaces/empresaResponse.interface";
import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;
export class EnterprisesEnterpriseService {
  constructor() { }

  public static async getEnterprises(enterprise_id: number): Promise<EmpresaResponse> {
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/empresas/${enterprise_id}`,
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
      console.error("Error al consultar empresas", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al consultar empresas",
      };
    }
  }

  public static async getApplicationsByEnterpriseId(enterpriseId: number): Promise<any> {
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

  public static async seguirEmpresa(id_seguidor: number, id_seguido: number): Promise<any> {

    console.log("Seguir empresa:", { id_seguidor, id_seguido });
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/empresas/seguir`,
        {
          method: "POST",
          body: JSON.stringify({ id_seguidor, id_seguido }),
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
      console.error("Error al seguir empresa", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al seguir empresa",
      };
    }
  }

  public static async dejarDeSeguirEmpresa(id_seguidor: number, id_seguido: number): Promise<any> {
    console.log("Dejar de seguir empresa:", { id_seguidor, id_seguido });
    try {
      const response = await fetch(
        `${apiUrl}/enterprise/empresas/dejar-seguir`,
        {
          method: "POST",
          body: JSON.stringify({ id_seguidor, id_seguido }),
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
      console.error("Error al dejar de seguir empresa", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al dejar de seguir empresa",
      };
    }
  }


}
