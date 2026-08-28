import { COR_FALLBACK_AREA } from "./constants";
import { OcorrenciaArea } from "@/types/ocorrencia-calendario.types";

export interface CorOcorrencia {
  corPrincipal: string;
  corsExtras: string[];
}

export function resolverCorOcorrencia(areas: OcorrenciaArea[]): CorOcorrencia {
  if (areas.length === 0) {
    return { corPrincipal: COR_FALLBACK_AREA, corsExtras: [] };
  }

  const [primeira, ...resto] = areas;
  return {
    corPrincipal: primeira.cor ?? COR_FALLBACK_AREA,
    corsExtras: resto.map((area) => area.cor ?? COR_FALLBACK_AREA),
  };
}
