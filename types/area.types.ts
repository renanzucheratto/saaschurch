export type RoleNaArea = 'lider' | 'membro';

export interface AreaMembro {
  id: string;
  nome: string;
  email: string;
}

export interface Area {
  id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
  lideres: AreaMembro[];
  membros: AreaMembro[];
  totalIntegrantes: number;
}
