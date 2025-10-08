import type { EmpresaCandidate } from "./empresa.candidate.interface";

export interface EmpresaResponse {
  success: boolean;
  data: EmpresaCandidate[];
  message: string;
}
