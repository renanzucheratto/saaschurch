export interface OcorrenciaArea {
  id: string;
  nome: string;
  cor: string | null;
}

export interface OcorrenciaHorarioExcecao {
  id?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
}

export interface OcorrenciaCalendario {
  id: string;
  titulo: string;
  nota: string | null;
  dataInicio: string;
  dataFim: string;
  horaInicioDefault: string;
  horaFimDefault: string;
  areas: OcorrenciaArea[];
  excecoes: OcorrenciaHorarioExcecao[];
  createdAt: string;
  updatedAt: string;
}
