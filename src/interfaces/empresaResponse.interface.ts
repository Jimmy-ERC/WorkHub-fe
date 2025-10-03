import type { Empresa } from "./empresa.interface";

export interface EmpresaResponse {
    success: boolean;
    data: Empresa[];
    message: string;
}

