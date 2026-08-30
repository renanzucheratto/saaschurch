export type TipoItemCalendario = "evento" | "ocorrencia" | "feriado";

export interface ExcecaoItemCalendario {
  data: string;
  horaInicio: string;
  horaFim: string;
}

export interface RecursoItemCalendario {
  corPrincipal: string;
  corsExtras: string[];
  nota?: string | null;
  ocorrenciaId?: string;
  eventoId?: string;
  excecoes?: ExcecaoItemCalendario[];
}

export interface ItemCalendario {
  id: string;
  tipo: TipoItemCalendario;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: RecursoItemCalendario;
}
