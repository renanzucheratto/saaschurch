export type TipoItemCalendario = "evento" | "ocorrencia";

export interface RecursoItemCalendario {
  corPrincipal: string;
  corsExtras: string[];
  nota?: string | null;
  ocorrenciaId?: string;
  eventoId?: string;
}

export interface ItemCalendario {
  id: string;
  tipo: TipoItemCalendario;
  title: string;
  start: Date;
  end: Date;
  resource: RecursoItemCalendario;
}
