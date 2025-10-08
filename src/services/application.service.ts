import { api } from "@/lib/api";

// Base API URL from environment variables
const apiUrl = api.baseUrl;

export class ApplicationService {

    constructor() {}

    public static async postApplication(id_trabajo:number, id_candidato: number,id_curriculum:number, mensaje: string){
        try {

          const response = await fetch(`${apiUrl}/enterprise/aplicaciones`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_trabajo,
              id_candidato,
              id_curriculum,
              mensaje
            })
          });

          const data = await response.json();

          console.log("response", data);
    
          
    
          return {
            success: data.success || false,
            data: data.data || [],
            message:
              data.message || `Error ${response.status}: ${response.statusText}`,
          };
        } catch (error) {
          console.error("Error al aplicar trabajo", error);
          return {
            success: false,
            data: [],
            message:
              error instanceof Error
                ? error.message
                : "Error desconocido al aplicar trabajo",
          };
        }
      }

}